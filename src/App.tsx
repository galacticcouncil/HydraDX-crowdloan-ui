import { ApolloProvider } from '@apollo/client';
import React from 'react';
import './App.css';
import { Dashboard } from './containers/Dashboard/Dashboard';
import { LatestBlockHeightProvider } from './hooks/useLatestBlockHeight';
import { PolkadotJsProvider } from './hooks/usePolkadotJs';
import { AccountsProvider } from './hooks/useAccounts';
import { client } from './lib/apollo';

function App() {
  return (
    <ApolloProvider client={client} >
      <PolkadotJsProvider>
        <LatestBlockHeightProvider>
          <AccountsProvider>
            <Dashboard />
          </AccountsProvider>
        </LatestBlockHeightProvider>
      </PolkadotJsProvider>
    </ApolloProvider>
  )
}

export default App;