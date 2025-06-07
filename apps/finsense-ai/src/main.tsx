import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './app/apollo-client';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'; // <-- FIXED
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthProvider } from './app/auth-context';
import { App } from './app/app';
import { store, persistor } from './app/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <ChakraProvider value={defaultSystem}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ChakraProvider>
          </BrowserRouter>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
