const config = {
  get ROOT_URL() {
    return process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:4000";
  },
  IS_DEVELOPMENT: process.env.NEXT_PUBLIC_IS_DEVELOPMENT !== "false",
};

export default config;
