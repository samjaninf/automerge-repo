import {
  DocHandle,
  Repo,
  isValidAutomergeUrl,
  // BroadcastChannelNetworkAdapter,
  // WebSocketClientAdapter,
  IndexedDBStorageAdapter,
  RepoContext,
} from "@automerge/react"

import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import ReactDOM from "react-dom/client"
import { App } from "./App.js"
import { State } from "./types.js"
import "./index.css"

import {
  PeerId,
  SubductionWebSocket,
  IndexedDbStorage,
  Subduction,
} from "@automerge/subduction"
import * as sam from "@automerge/sedimentree_automerge"

import * as sub from "@automerge/subduction"
console.log("exports:", Object.keys(sub))

// import wasmUrl from "@automerge/subduction/subduction_wasm_bg.wasm?wasm"
;(async () => {
  const peerId = new PeerId(new Uint8Array(32)) // FIXME
  const ws = new WebSocket("ws://localhost:8080")
  const subWs = new SubductionWebSocket(peerId, ws, 5000)
  const db = await IndexedDbStorage.setup(indexedDB)
  const subduction = new Subduction(db)

  const oldDb = new IndexedDBStorageAdapter("automerge-repo-demo-todo")
  const repo = new Repo({
    network: [],
    subduction,
    storage: oldDb,
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
