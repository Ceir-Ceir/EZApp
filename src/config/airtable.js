// airtable.js
import Airtable from 'airtable';

const base = new Airtable({apiKey: 'your-airtable-api-key'}).base('your-base-id');

export const saveUserToAirtable = async (userData) => {
    try {
        const record = await base('Users').create([
            {
                fields: {
                    'Email': userData.email,
                    'Name': userData.displayName,
                    'UID': userData.uid,
                    // Add other fields as needed
                }
            }
        ]);
        return record;
    } catch (error) {
        console.error('Error saving to Airtable:', error);
        throw error;
    }
};

export default base;