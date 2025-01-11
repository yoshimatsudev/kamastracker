
export const load = async ({ fetch }) => {
  const response = await fetch("/");

  const data = await response.json()
  return {
    data,
  };
};

