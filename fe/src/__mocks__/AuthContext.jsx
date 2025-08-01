
export const useAuth = () => ({
  user: { name: "Test User", email: "test@example.com" },
  logout: jest.fn(),
});
