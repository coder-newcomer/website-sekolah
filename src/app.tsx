import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import './app.css'
import Header from './components/section/Header'
import { metadata } from '~/lib/backend/server.config'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>{`Official Website – ${metadata().sekolah}`}</Title>
          <Header />
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}>
      <FileRoutes />
    </Router>
  )
}
