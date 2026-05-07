import { db, storage } from "./firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Fetch all packaging options
export const getPackagingOptions = async () => {
  try {
    const packagingCol = collection(db, "gift_packaging");
    const snapshot = await getDocs(packagingCol);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching packaging options:", error);
    throw error;
  }
};

// Add new packaging option
export const addPackagingOption = async (data, imageFile = null) => {
  try {
    let imageUrl = data.image || "";
    
    if (imageFile) {
      const fileName = `packaging_${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, `packaging/${fileName}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    const docRef = await addDoc(collection(db, "gift_packaging"), {
      ...data,
      image: imageUrl,
      createdAt: serverTimestamp(),
      enabled: data.enabled !== undefined ? data.enabled : true
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding packaging option:", error);
    throw error;
  }
};

// Update packaging option
export const updatePackagingOption = async (id, data, imageFile = null) => {
  try {
    let imageUrl = data.image || "";
    
    if (imageFile) {
      const fileName = `packaging_${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, `packaging/${fileName}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    const packagingRef = doc(db, "gift_packaging", id);
    await updateDoc(packagingRef, {
      ...data,
      image: imageUrl,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error updating packaging option:", error);
    throw error;
  }
};

// Delete packaging option
export const deletePackagingOption = async (id) => {
  try {
    await deleteDoc(doc(db, "gift_packaging", id));
    return true;
  } catch (error) {
    console.error("Error deleting packaging option:", error);
    throw error;
  }
};
