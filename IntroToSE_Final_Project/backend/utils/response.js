/** 
 * Status 200: OK
 * GET, PUT response on success
*/

export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/** 
 * Status 201: Created
 * POST response on success
*/

export const sendCreated = (res, data = {}, message = 'Created', statusCode = 201) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/** 
 * Status 204: No Content
 * DELETE response on success
*/

export const sendNoContent = (res, message = 'No Content', statusCode = 204) => {
  return res.status(statusCode).json({
    success: true,
    message
  });
};

/** 
 * Status 400: Bad Request
 * POST response on success
*/

export const sendBadRequest = (res, message = 'Bad Request', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/** 
 * Status 401: Unauthorized
 * POST response on success
*/

export const sendUnauthorized = (res, message = 'Unauthorized', statusCode = 401) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/** 
 * Status 403: Forbidden
 * POST response on success
*/

export const sendForbidden = (res, message = 'Forbidden', statusCode = 403) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/** 
 * Status 404: Not Found
 * POST response on success
*/

export const sendNotFound = (res, message = 'Not Found', statusCode = 404) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/** 
 * Status 500: Internal Server Error
 * POST response on success
*/

export const sendServerError = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
