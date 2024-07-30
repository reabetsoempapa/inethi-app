import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('file_manager.db');

// Initialize the database
db.transaction(tx => {
    tx.executeSql(
        'CREATE TABLE IF NOT EXISTS cache (id INTEGER PRIMARY KEY NOT NULL, url TEXT, filePath TEXT, timestamp INTEGER);'
    );
});

class FileManager {
    static async getData(url) {
        const data = await FileManager.checkCache(url);
        if (data) {
            return data;
        }
        return FileManager.fetchAndStoreData(url);
    }

    static checkCache(url) {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM cache WHERE url = ?',
                    [url],
                    (_, { rows: { _array } }) => {
                        if (_array.length > 0) {
                            const { filePath, timestamp } = _array[0];
                            // Check if the data is still valid (e.g., not older than 1 day)
                            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                                resolve(FileSystem.readAsStringAsync(filePath));
                                return;
                            }
                        }
                        resolve(null);
                    },
                    (_, error) => reject(error)
                );
            });
        });
    }

    static async fetchAndStoreData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const fileName = url.split('/').pop();
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
            FileManager.storeInCache(url, fileUri);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    static storeInCache(url, filePath) {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO cache (url, filePath, timestamp) VALUES (?, ?, ?)',
                [url, filePath, Date.now()],
                null,
                (txObj, error) => console.error('Error inserting into cache:', error)
            );
        });
    }
}

export default FileManager;
