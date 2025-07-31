import { NetworkAdapterInterface } from "./network/NetworkAdapterInterface.js"
import { DocumentId } from "./types.js"
import * as A from "@automerge/automerge"

export interface Sedimentree {
  // Called by the repo when the network should start work
  start(): void

  // Called by the repo when the network should shut down
  stop(): Promise<void>

  // A promise which returns true when all the network adapters have said they
  whenReady(): Promise<boolean>

  find(documentId: DocumentId): Promise<Uint8Array[] | undefined>

  // Called whenever the sedimentree network is aware of new changes for a document.
  on(
    event: "change",
    documentId: DocumentId,
    callback: (data: Uint8Array[]) => void
  ): void
  // Register a callback to provide bundles for the sedimentree
  on(
    event: "bundleRequired",
    callback: (documentId: DocumentId, start: string, end: string) => Uint8Array
  ): void

  // Stop listening for changes to a particular document
  off(
    event: "change",
    documentId: DocumentId,
    callback: (data: Uint8Array[]) => void
  ): void
  off(
    event: "bundleRequired",
    callback: (documentId: DocumentId, start: string, end: string) => Uint8Array
  ): void

  // Notify the sedimentree that there are new commits (called whenever the document changes)
  newCommit(documentId: DocumentId, hash: string, data: Uint8Array): void
}

export type AdapterId = string & { __adapterId: true }

export class DummySedimentree implements Sedimentree {
  #docs: Map<DocumentId, A.Doc<unknown>> = new Map()
  #networkAdapters: Map<AdapterId, NetworkAdapterInterface> = new Map()

  constructor({
    docs,
    networkAdapters,
  }: {
    docs: Map<DocumentId, A.Doc<unknown>>
    networkAdapters: NetworkAdapterInterface[]
  }) {
    this.#docs = docs

    for (const adapter of networkAdapters) {
      const adapterId: AdapterId = `adapter-${Math.random()
        .toString(36)
        .substring(2)}` as AdapterId
      this.#networkAdapters.set(adapterId, adapter)
    }
  }

  start(): void {}

  getAdapters(): Map<AdapterId, NetworkAdapterInterface> {
    return this.#networkAdapters
  }

  addNetworkAdapter(adapter: NetworkAdapterInterface): AdapterId {
    const adapterId: AdapterId = `adapter-${Math.random()
      .toString(36)
      .substring(2)}` as AdapterId
    this.#networkAdapters.set(adapterId, adapter)
    return adapterId
  }

  removeNetworkAdapter(adapterId: AdapterId): void {
    this.#networkAdapters.get(adapterId)?.disconnect() // FIXME needed?
    this.#networkAdapters.delete(adapterId)
  }

  async stop(): Promise<void> {}
  async whenReady(): Promise<boolean> {
    return true
  }

  // NOTE BZ right now returns a commplete Automerge RLE compressed doc
  find(documentId: DocumentId): Promise<Uint8Array[] | undefined> {
    console.log("Finding doc", documentId)
    const doc = this.#docs.get(documentId)
    if (doc) {
      console.log("DummySedimentree returning doc", documentId, doc)
      return Promise.resolve([A.save(doc)])
    } else {
      return Promise.resolve(undefined)
    }
  }

  // Overload signatures
  on(
    event: "change",
    documentId: DocumentId,
    callback: (data: Uint8Array[]) => void
  ): void
  on(
    event: "bundleRequired",
    callback: (documentId: DocumentId, start: string, end: string) => Uint8Array
  ): void
  // Implementation signature
  on(
    event: "change" | "bundleRequired",
    documentIdOrCallback:
      | DocumentId
      | ((documentId: DocumentId, start: string, end: string) => Uint8Array),
    callback?: (data: Uint8Array[]) => void
  ): void {}

  // Overload signatures for off
  off(
    event: "change",
    documentId: DocumentId,
    callback: (data: Uint8Array[]) => void
  ): void
  off(
    event: "bundleRequired",
    callback: (documentId: DocumentId, start: string, end: string) => Uint8Array
  ): void
  // Implementation signature
  off(
    event: "change" | "bundleRequired",
    documentIdOrCallback:
      | DocumentId
      | ((documentId: DocumentId, start: string, end: string) => Uint8Array),
    callback?: (data: Uint8Array[]) => void
  ): void {
    // DummySedimentree doesn't actually store listeners, so this is a no-op
    // In a real implementation, you would remove the listener here
  }

  newCommit(documentId: DocumentId, hash: string, data: Uint8Array): void {}
}
