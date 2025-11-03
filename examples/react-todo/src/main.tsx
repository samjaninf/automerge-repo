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

import { PeerId, IndexedDbStorage, Subduction } from "@automerge/subduction"
// import * as sam from "@automerge/sedimentree_automerge"

import * as sub from "@automerge/subduction"
;(async () => {
    console.log("Starting up...")
    console.log(">>>>>>>>>>>>>>>> -1")
    // const ws = new WebSocket("//127.0.0.1:8080") //
    console.log(">>>>>>>>>>>>>>>> -2")
    // const subWs = new SubductionWebSocket(peerId, ws, 5000)
    console.log(">>>>>>>>>>>>>>>> -3")
    const db = await IndexedDbStorage.setup(indexedDB)
    console.log(">>>>>>>>>>>>>>>> -4")
    // console.log("SubductionWebSocket:", subWs)
    console.log(">>>>>>>>>>>>>>>> -5")
    const subduction = new Subduction(db)
    console.log(">>>>>>>>>>>>>>>> 0")

    const oldDb = new IndexedDBStorageAdapter("automerge-repo-demo-todo")
    const repo = new Repo({
        network: [],
        subduction,
        storage: oldDb,
    })
    console.log(">>>>>>>>>>>>>>>> 1")

    declare global {
        interface Window {
            handle: DocHandle<unknown>
            repo: Repo
        }
    }
    console.log(">>>>>>>>>>>>>>>> 2")

    const rootDocUrl = `${document.location.hash.substring(1)}`
    let handle
    if (isValidAutomergeUrl(rootDocUrl)) {
        handle = await repo.find(rootDocUrl)
    } else {
        handle = repo.create<State>({ todos: [] })
    }
    console.log(">>>>>>>>>>>>>>>> 3")
    const docUrl = (document.location.hash = handle.url)
    window.handle = handle // we'll use this later for experimentation
    window.repo = repo

    console.log(">>>>>>>>>>>>>>>> 4")

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
