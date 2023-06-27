import * as admin from "firebase-admin";
export class FirestoreClient {
  db: FirebaseFirestore.Firestore;
  postedStoriesCollectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  constructor() {
    this.db = admin.firestore();
    this.postedStoriesCollectionRef = this.db.collection("v1").doc("postedEntries").collection("entries");
  }
  async insertPostedEntry(entry: HatenaItem): Promise<void> {
    await this.postedStoriesCollectionRef.doc().set({
      ...entry,
      createdAt: new Date().toISOString(),
    });
  }

  async updatePostedEntry(entryLink: string, summary: string): Promise<void> {
    const docsRef = await this.postedStoriesCollectionRef.where("link", "==", entryLink).limit(1).get();
    docsRef.docs[0].ref.update({
      summary,
    });
  }

  async isPostedEntry(entryLink: string): Promise<boolean> {
    const docsRef = await this.postedStoriesCollectionRef.where("link", "==", entryLink).get();
    return docsRef.docs.length > 0;
  }
}
