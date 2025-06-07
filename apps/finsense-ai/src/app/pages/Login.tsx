import { useState } from 'react';
import { Box, Button, Input, Heading, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../auth-context';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        fullName
        email
      }
      role {
        _id
        name
        permissions {
          _id
          name
        }
      }
      permissions {
        _id
        name
      }
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login?.token) {
        const { token, user, role, permissions } = data.login;
        login(token, user, role, permissions);
        navigate('/');
      } else {
        alert('Login failed. Invalid credentials.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during login');
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={20}>
      <Heading mb={6}>Login</Heading>
      <VStack spacing={4}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleLogin} isLoading={loading}>
          Login
        </Button>
      </VStack>
    </Box>
  );
}
