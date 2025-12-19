import React, { useState } from "react";
import { Users, Mail, Award } from 'lucide-react';

// Team Members Information
const MockteamMembers = [
  {
    id: "23127263",
    name: "Vũ Thế Anh",
    role: "Monitor",
    avatar:
      "",
    email: "vtanh23@clc.fitus.edu.vn",
  },
  {
    id: "23127151",
    name: "Lê Tuấn Anh",
    role: "Member",
    avatar:
      "",
    email: "ltanh23@clc.fitus.edu.vn",
  },
  {
    id: "23127315",
    name: "Nguyễn Trần Thiên An",
    role: "Member",
    avatar:
      "",
    email: "nttan23@clc.fitus.edu.vn",
  },
  {
    id: "23127398",
    name: "Đinh Xuân Khương",
    role: "Member",
    avatar:
      "",
    email: "dxkhuong@clc.fitus.edu.vn",
  },
];

// Show team members information

export default function Abouts() {
  const [teamMembers] = useState(MockteamMembers);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
        </div>
        <p className="text-gray-600">Team member Contribution</p>
      </div>

      {/* Team Members Grid - 2 columns với khoảng cách ngang nhỏ hơn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-10">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-linear-to-br from-white to-blue-50 rounded-2xl border-4 border-blue-300 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 flex flex-col items-center cursor-pointer transform hover:-translate-y-2"
          >
            {/* Avatar - Ảnh tròn, căn giữa */}
            <div className="mb-4 relative group">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-40 h-52 object-cover rounded-2xl border-4 border-blue-400 shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all duration-300 -z-10"></div>
            </div>

            {/* Member Info - Chữ ở dưới, căn giữa */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                {member.name}
              </h3>
              <p className="text-blue-600 font-bold mb-2 text-lg bg-blue-100 px-4 py-1 rounded-full inline-block">{member.role}</p>
              <p className="text-gray-500 text-sm mb-2 font-semibold">ID: {member.id}</p>
              <p className="text-gray-600 text-sm hover:text-blue-500 transition-colors">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
