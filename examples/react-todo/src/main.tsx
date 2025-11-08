import {
    DocHandle,
    Repo,
    isValidAutomergeUrl,
    // BroadcastChannelNetworkAdapter,
    // WebSocketClientAdapter,
    IndexedDBStorageAdapter,
    RepoContext,
} from "@automerge/react"
import {
    PeerId,
    IndexedDbStorage,
    Subduction,
    SedimentreeId,
    LooseCommit,
    Fragment,
    Digest,
} from "@automerge/subduction_automerge"
import {
    next as Automerge,
    encodeChange,
    Heads,
} from "@automerge/automerge/slim"

import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import ReactDOM from "react-dom/client"
import { App } from "./App.js"
import { State } from "./types.js"
import "./index.css"
;(async () => {
    const db = await IndexedDbStorage.setup(indexedDB)
    // const dbObj = {
    //     saveLooseCommit: (
    //         sedimentreeId: SedimentreeId,
    //         commit: LooseCommit
    //     ): Promise<void> => {
    //         return db.saveLooseCommit(sedimentreeId, commit)
    //     },

    //     saveFragment: (
    //         sedimentreeId: SedimentreeId,
    //         fragment: Fragment
    //     ): Promise<void> => {
    //         return db.saveFragment(sedimentreeId, fragment)
    //     },
    //     saveBlob: (data: Uint8Array): Promise<Digest> => {
    //         return db.saveBlob(data)
    //     },

    //     loadLooseCommits: (
    //         sedimentreeId: SedimentreeId
    //     ): Promise<LooseCommit[]> => {
    //         return db.loadLooseCommits(sedimentreeId)
    //     },

    //     loadFragments: (sedimentreeId: SedimentreeId): Promise<Fragment[]> => {
    //         return db.loadFragments(sedimentreeId)
    //     },
    //     loadBlob: (digest: Digest): Promise<Uint8Array | null> => {
    //         return db.loadBlob(digest)
    //     },
    // }
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
    window.am = Automerge
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
