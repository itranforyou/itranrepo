import { db, storage } from "./firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Fetch all products
export const getProducts = async () => {
  try {
    const productsCol = collection(db, "products");
    // Removing orderBy for now to ensure all products show up even without createdAt
    const snapshot = await getDocs(productsCol);
    const productList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure images is always an array for the UI
        images: data.images || (data.image ? [data.image] : [])
      };
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Add new product with multiple image support
export const addProduct = async (productData, imageFiles = []) => {
  const uploadWithTimeout = (storageRef, file) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Upload timed out after 60s")), 60000);
      uploadBytes(storageRef, file).then(res => {
        clearTimeout(timeout);
        resolve(res);
      }).catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  };

  try {
    let uploadedUrls = [];
    
    if (imageFiles && imageFiles.length > 0) {
      console.log(`[STORAGE] Starting upload for ${imageFiles.length} files...`);
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `products/${fileName}`);
          
          console.log(`[STORAGE] Uploading file ${i + 1}/${imageFiles.length}: ${file.name}`);
          const uploadResult = await uploadWithTimeout(storageRef, file);
          const url = await getDownloadURL(uploadResult.ref);
          
          console.log(`[STORAGE] Success: ${url}`);
          uploadedUrls.push(url);
        } catch (uploadErr) {
          console.error(`[STORAGE] Failed file ${i + 1}:`, uploadErr);
          // If a file fails, we'll throw to let the UI know it's not complete
          throw new Error(`Failed to upload "${file.name}": ${uploadErr.message}`);
        }
      }
    }

    // 2. Combine uploaded URLs with any manually provided URLs in productData
    // We expect productData.images to be an array if provided
    const finalImages = [
      ...uploadedUrls,
      ...(productData.images || [])
    ];

    // Handle single 'image' field for legacy support if needed
    if (productData.image && !finalImages.includes(productData.image)) {
      finalImages.push(productData.image);
    }

    // 3. Add product to Firestore
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      image: finalImages[0] || "", // First image as main
      images: finalImages,
      desc: productData.description || productData.desc || "",
      createdAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error("[STORAGE] Error adding product:", error);
    throw error;
  }
};

// Update existing product
export const updateProduct = async (productId, updatedData, newImageFiles = []) => {
  try {
    let uploadedUrls = [];
    
    // 1. Upload new images if provided
    if (newImageFiles && newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const fileName = `${Date.now()}_upd_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `products/${fileName}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        uploadedUrls.push(url);
      }
    }

    const finalImages = [
      ...(updatedData.images || []),
      ...uploadedUrls
    ];

    const { doc, updateDoc } = await import("firebase/firestore");
    const productRef = doc(db, "products", productId);
    
    await updateDoc(productRef, {
      ...updatedData,
      image: finalImages[0] || "",
      images: finalImages,
      desc: updatedData.description || updatedData.desc || "",
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Helper to check if a URL points to a video format
export const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
};
