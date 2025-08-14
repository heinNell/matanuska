import { FirestoreDataConverter, Timestamp } from "firebase/firestore";
import { Tyre } from "./TyreModel";

export const tyreConverter: FirestoreDataConverter<Tyre> = {
  toFirestore(tyre: Tyre) {
    return {
      ...tyre,
      createdAt: tyre.createdAt ?? Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Tyre;
  },
};
