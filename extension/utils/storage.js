// Chrome storage utilities for the HireAssist extension

class StorageUtils {
    // Sync storage methods (for user settings, limited to 100KB)
    static async setSyncData(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            console.log(`Sync data saved: ${key}`);
        } catch (error) {
            console.error('Error saving sync data:', error);
            throw error;
        }
    }

    static async getSyncData(key) {
        try {
            const result = await chrome.storage.sync.get([key]);
            return result[key];
        } catch (error) {
            console.error('Error getting sync data:', error);
            return null;
        }
    }

    static async removeSyncData(key) {
        try {
            await chrome.storage.sync.remove(key);
            console.log(`Sync data removed: ${key}`);
        } catch (error) {
            console.error('Error removing sync data:', error);
            throw error;
        }
    }

    // Local storage methods (for larger data, limited to 5MB)
    static async setLocalData(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
            console.log(`Local data saved: ${key}`);
        } catch (error) {
            console.error('Error saving local data:', error);
            throw error;
        }
    }

    static async getLocalData(key) {
        try {
            const result = await chrome.storage.local.get([key]);
            return result[key];
        } catch (error) {
            console.error('Error getting local data:', error);
            return null;
        }
    }

    static async removeLocalData(key) {
        try {
            await chrome.storage.local.remove(key);
            console.log(`Local data removed: ${key}`);
        } catch (error) {
            console.error('Error removing local data:', error);
            throw error;
        }
    }

    // Batch operations
    static async setBatchData(data, useSync = true) {
        try {
            const storage = useSync ? chrome.storage.sync : chrome.storage.local;
            await storage.set(data);
            console.log('Batch data saved:', Object.keys(data));
        } catch (error) {
            console.error('Error saving batch data:', error);
            throw error;
        }
    }

    static async getBatchData(keys, useSync = true) {
        try {
            const storage = useSync ? chrome.storage.sync : chrome.storage.local;
            const result = await storage.get(keys);
            return result;
        } catch (error) {
            console.error('Error getting batch data:', error);
            return {};
        }
    }

    // Clear all data
    static async clearAllData(includeSync = false) {
        try {
            await chrome.storage.local.clear();
            console.log('Local storage cleared');
            
            if (includeSync) {
                await chrome.storage.sync.clear();
                console.log('Sync storage cleared');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    // Get storage usage
    static async getStorageUsage() {
        try {
            const [localUsage, syncUsage] = await Promise.all([
                chrome.storage.local.getBytesInUse(),
                chrome.storage.sync.getBytesInUse()
            ]);
            
            return {
                local: {
                    bytes: localUsage,
                    percentage: (localUsage / (5 * 1024 * 1024)) * 100 // 5MB limit
                },
                sync: {
                    bytes: syncUsage,
                    percentage: (syncUsage / (100 * 1024)) * 100 // 100KB limit
                }
            };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return null;
        }
    }

    // Listen for storage changes
    static addStorageListener(callback) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            callback(changes, areaName);
        });
    }

    // User profile methods
    static async saveUserProfile(profile) {
        return await this.setSyncData('userProfile', profile);
    }

    static async getUserProfile() {
        return await this.getSyncData('userProfile');
    }

    // Settings methods
    static async saveSettings(settings) {
        return await this.setSyncData('extensionSettings', settings);
    }

    static async getSettings() {
        const defaultSettings = {
            backendUrl: 'http://localhost:3000',
            autoFill: false,
            smartSuggestions: true,
            notificationsEnabled: true
        };
        
        const settings = await this.getSyncData('extensionSettings');
        return { ...defaultSettings, ...settings };
    }

    // Job data methods (using local storage for larger data)
    static async saveJobData(jobData) {
        return await this.setLocalData('currentJobData', jobData);
    }

    static async getJobData() {
        return await this.getLocalData('currentJobData');
    }

    static async saveJobHistory(jobHistory) {
        return await this.setLocalData('jobHistory', jobHistory);
    }

    static async getJobHistory() {
        return await this.getLocalData('jobHistory') || [];
    }

    static async addToJobHistory(jobData) {
        const history = await this.getJobHistory();
        history.unshift(jobData); // Add to beginning
        
        // Keep only last 50 jobs
        if (history.length > 50) {
            history.splice(50);
        }
        
        return await this.saveJobHistory(history);
    }

    // Resume data methods
    static async saveResumeData(resumeData) {
        return await this.setLocalData('resumeData', resumeData);
    }

    static async getResumeData() {
        return await this.getLocalData('resumeData');
    }

    // Cache methods for API responses
    static async setCacheData(key, data, ttl = 3600000) { // 1 hour default TTL
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        return await this.setLocalData(`cache_${key}`, cacheEntry);
    }

    static async getCacheData(key) {
        const cacheEntry = await this.getLocalData(`cache_${key}`);
        
        if (!cacheEntry) return null;
        
        // Check if cache has expired
        if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
            await this.removeLocalData(`cache_${key}`);
            return null;
        }
        
        return cacheEntry.data;
    }

    // Utility method to migrate data if needed
    static async migrateData() {
        try {
            // Check if migration is needed
            const migrationVersion = await this.getLocalData('migrationVersion');
            const currentVersion = 1;
            
            if (migrationVersion === currentVersion) {
                return; // No migration needed
            }
            
            // Perform migration logic here
            console.log('Performing data migration...');
            
            // Update migration version
            await this.setLocalData('migrationVersion', currentVersion);
            console.log('Data migration completed');
        } catch (error) {
            console.error('Error during data migration:', error);
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
} else {
    window.StorageUtils = StorageUtils;
}
