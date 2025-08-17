export const officesData = [
  {
    name: 'Main HQ',
    latitude: 40.712776,
    longitude: -74.005974,
    phoneNumber: '123-456-7890',
    admin: {
      name: 'Office Admin',
      email: 'admin@office.com',
      password: 'Admin@1234',
    },
    employees: [
      {
        name: 'Verified Employee',
        email: 'verified@office.com',
        password: 'Verified@1234',
        isVerified: true,
      },
      {
        name: 'Non-Verified Employee',
        email: 'nonverified@office.com',
        password: 'NonVerified@1234',
        isVerified: false,
      },
    ],
  },
  {
    name: 'Branch Office',
    latitude: 34.052235,
    longitude: -118.243683,
    phoneNumber: '987-654-3210',
    admin: {
      name: 'Branch Admin',
      email: 'admin@branch.com',
      password: 'BranchAdmin@1234',
    },
    employees: [
      {
        name: 'Branch Verified',
        email: 'branch.verified@office.com',
        password: 'BranchVerified@1234',
        isVerified: true,
      },
      {
        name: 'Branch Non-Verified',
        email: 'branch.nonverified@office.com',
        password: 'BranchNonVerified@1234',
        isVerified: false,
      },
    ],
  },
];
