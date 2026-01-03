import { Timestamp, FieldValue } from 'firebase/firestore';

// Type guard to check if a value is a Firestore Timestamp
function isTimestamp(value: any): value is Timestamp {
  return value && typeof value.toDate === 'function';
}

/**
 * Recursively traverses an object or array and converts all Firestore Timestamp
 * instances to their ISO string representation. This is useful for serializing
 * data to be passed from Server Components to Client Components.
 * @param data The data to serialize (object or array).
 * @returns The serialized data.
 */
export function serializeTimestamps<T>(data: T): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeTimestamps(item)) as any;
  }

  if (typeof data === 'object') {
    // Handle Firestore Timestamps
    if (isTimestamp(data)) {
      return data.toDate().toISOString() as any;
    }
    
    // For other objects, traverse their properties
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Firestore FieldValue objects are not serializable, return null or a placeholder
        if ((data[key] as any) instanceof FieldValue) {
           newData[key] = null; // Or some other serializable placeholder
        } else {
           newData[key] = serializeTimestamps((data as any)[key]);
        }
      }
    }
    return newData as T;
  }
  
  return data;
}
