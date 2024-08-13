

const login = async (email, password) => {
  console.log({ email, password });
  try {
    const { status, data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signin',
      data: { email, password },
    });
    console.log('data: ', data);
  } catch (error) {
    console.log('error: ', error.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Form');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
