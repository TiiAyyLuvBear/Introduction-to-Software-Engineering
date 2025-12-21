import mongoose from 'mongoose'

let cachedTxSupport

export async function mongoSupportsTransactions() {
  if (cachedTxSupport !== undefined) return cachedTxSupport

  try {
    const admin = mongoose.connection?.db?.admin?.()
    if (!admin) {
      cachedTxSupport = false
      return cachedTxSupport
    }

    // `hello` works on modern MongoDB; older servers accept `isMaster`.
    let hello
    try {
      hello = await admin.command({ hello: 1 })
    } catch {
      hello = await admin.command({ isMaster: 1 })
    }

    // Transactions require a replica set member or a mongos.
    cachedTxSupport = Boolean(hello?.setName || hello?.msg === 'isdbgrid')
    return cachedTxSupport
  } catch {
    cachedTxSupport = false
    return cachedTxSupport
  }
}

export async function withMongoSession(work, { transaction = true } = {}) {
  const session = await mongoose.startSession()
  const canUseTxn = transaction && (await mongoSupportsTransactions())

  if (canUseTxn) {
    session.startTransaction()
  }

  try {
    const result = await work(session, { transaction: canUseTxn })
    if (canUseTxn) await session.commitTransaction()
    return result
  } catch (err) {
    if (canUseTxn) {
      try {
        await session.abortTransaction()
      } catch {
        // ignore
      }
    }
    throw err
  } finally {
    await session.endSession()
  }
}
