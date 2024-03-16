interface RegisterDTO {
  email: string;
  password: string;
  username: string;
};

interface LoginDto {
  email: string;
  password: string;
  username: string;
};

export { RegisterDTO, LoginDto };