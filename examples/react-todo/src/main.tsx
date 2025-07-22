import {
  DocHandle,
  Repo,
  isValidAutomergeUrl,
  BroadcastChannelNetworkAdapter,
  WebSocketClientAdapter,
  IndexedDBStorageAdapter,
  RepoContext,
} from "@automerge/react"

import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import ReactDOM from "react-dom/client"
import { App } from "./App.js"
import { State } from "./types.js"
import "./index.css"

import { Sedimentree, DummySedimentree } from "../../../packages/automerge-repo/src/sedimentree"
import init, { initSync, SedimentreeNetwork } from "../pkg/sedimentree_sync_wasm.js"

(async () => {
  await init("../pkg/sedimentree_sync_wasm_bg.wasm")

  const repo = new Repo({
    network: [],
    sedimentreeAdapters: [new WebSocketClientAdapter("ws://localhost:3030")],
    sedimentreeImplementation: new SedimentreeNetwork([]),
    storage: new IndexedDBStorageAdapter("automerge-repo-demo-todo"),
  })

  declare global {
    interface Window {
      handle: DocHandle<unknown>
      repo: Repo
    }
  }

  const rootDocUrl = `${document.location.hash.substring(1)}`
  let handle
  if (isValidAutomergeUrl(rootDocUrl)) {
    handle = await repo.find(rootDocUrl)
  } else {
    handle = repo.create<State>({ todos: [] })
  }
  const docUrl = (document.location.hash = handle.url)
  window.handle = handle // we'll use this later for experimentation
  window.repo = repo

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <RepoContext.Provider value={repo}>
    <React.StrictMode>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <App url={docUrl} />
      </Suspense>
    </ErrorBoundary>
    </React.StrictMode>
    </RepoContext.Provider>
  )
})()
