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
import { State, PeerId } from "./types.js"
import "./index.css"

import {
  Subduction,
  DummySubduction,
  DocumentId,
} from "../../../packages/automerge-repo/src/subduction"
import init, { SubductionSyncWasm } from "../pkg/subduction_sync_wasm.js"
;(async () => {
  await init("../pkg/subduction_sync_wasm_bg.wasm?url")

  const ws = new WebSocketClientAdapter("ws://localhost:8080")
  ws.connect("peer-id" as PeerId)
  await ws.whenReady()

  const db = new IndexedDBStorageAdapter("automerge-repo-demo-todo")

  // FIXME
  const subduction = new SubductionSyncWasm(new Map(), [ws], [db])

  subduction.on(
    "some_doc",
    ((docId: DocumentId) => {
      console.log(`Ran for: ${docId}`)
    }).bind(null)
  )

  const repo = new Repo({
    network: [],
    subduction, // TODO Init with a JS websocket
    // TODO single messgae: requets a doc, reponds with witg I have it or I don't
    // TODO CLI tool
    // TODO Stream & Sync interfaces in Rust, but harder in JS/Wasm
    // TODO Actually store to disk on sync server
    storage: db,
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
