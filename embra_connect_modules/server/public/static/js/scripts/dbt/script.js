// Selectors
// [FORM] input
const HOST = document.getElementById('url');
const DB = document.getElementById('db');
const PORT = document.getElementById('port');
const ATC = document.getElementById('analytics-tracking-code');

// [CONNECTION TYPES]
const AVAILABLE_CONNECTION_TYPES = Object.freeze({
    POSTGRES: 1,
    DBT: 2,
    AWS: 3
});

const postgres_selector = document.querySelector('.postgres');
const mssql_selector = document.querySelector('.mssql');
const mysql_selector = document.querySelector('.mysql');
const aws_selector = document.querySelector('.aws');
const dbt_selector = document.querySelector('.dbt');


// Depending on what the user has selected
let SELECTED_CONNECTION_TYPE;


// NOTE -> The [DBT_API_TOKEN] should be provided by the user
// The credentials can be configured on the <connection> page
// The [DBT_SERVICE] will return a [FAIL] status in case the [TOKEN] is INVALID
const DBT_SERVICE_URL = 'http://localhost:3000/dbt';
const DBT_API_TOKEN = document.getElementById('token');

// Consume the [ENCODED] token istead
let ENCODED_TOKEN;

const SAVE_BUTTON = document.getElementById('save-button');

// [DATA] retrieved from the [OBJECT STORE]
let OBJECT_STORE_DATA;


// This class performs [GENERIC] ERROR handling
class ErrorHandling {
    static propagateError(message, process) {
        console.error(`
            [AN ERROR OCCURRED]
            [MESSAGE] -> ${message}
            [PROCESS] -> ${process}
        `);
    }
}

class FormControls {
    static async getDBTInfo() {
        /** 
         * @name getDBTInfo
         * @description Retrieve [USER INFO] via the [DBT_SERVICE]
         * @param None 
         * @returns {Promise<void>}
         * */

        try {
            // Define readonly properties
            let data = {
                readonly: {
                    url: DBT_SERVICE_URL,
                    token: DBT_API_TOKEN.value
                },
                // Handle [serialization]
                get encodedUrl() {
                    let hexToken = Array.from(this.readonly.token).map(c => c.charCodeAt(0).toString(16)).join('');
                    let encodedToken = encodeURIComponent(hexToken);

                    // Set [GLOBAL] value for the [ENCODED] token
                    ENCODED_TOKEN = encodedToken;

                    // Return formatted [URL]
                    return this.readonly.url + '?token=' + encodedToken;
                }
            };

            // Make the [data] object <readonly>
            Object.freeze(data.readonly);

            const response = await fetch(`${data.encodedUrl}`);
            const userInfo = await response.json();

            // Retrieve set containing [USER] specific info
            let _userInfo = userInfo.data[0];

            // Store [_userInfo] to indexedDB
            await DbOperations.h_ADD(_userInfo);

            // [DEBUG] logs
            // console.log(userInfo.data[0]);
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> FormControls.getDBTInfo'
            );
        }
    }

    static setConnectionType(connection_type) {
        /** 
         * @name setConnectionType
         * @description Retrieve selected connection type
         * @param {Number} connection_type
         * @returns {void}
         * */

        switch (connection_type) {
            case AVAILABLE_CONNECTION_TYPES.POSTGRES:
                SELECTED_CONNECTION_TYPE = 'POSTGRES'

                Utils.cssClassManager(postgres_selector);
                console.log('Selected connection type:', SELECTED_CONNECTION_TYPE);
                break;
            case AVAILABLE_CONNECTION_TYPES.DBT:
                SELECTED_CONNECTION_TYPE = 'DBT Cloud'

                Utils.cssClassManager(dbt_selector);
                console.log('Selected connection type:', SELECTED_CONNECTION_TYPE);
                break;
            case AVAILABLE_CONNECTION_TYPES.AWS:
                SELECTED_CONNECTION_TYPE = 'AWS'

                Utils.cssClassManager(aws_selector);
                console.log('Selected connection type:', SELECTED_CONNECTION_TYPE);
                break;
            default:
                break;
        };

    }

    // Validate user [INPUT] 
    static validateForm() {
        /** 
         * @name validateForm
         * @description Validate User Input
         * @param None 
         * @returns {void}
         * */

        // Check if any fields are empty
        if (HOST.value.length > 0 && DB.value.length > 0 && PORT.value.length > 0 && DBT_API_TOKEN.value.length > 0) {
            if (FormControls.validateURL(HOST.value)) {
                // SAVE_BUTTON.removeAttribute('disabled');

                // Persist [CONNECTION] configuration to [EC_SECRETS_MANAGER] as ENVIRONMENT variables that can be accessed by existing services

                FormControls.getDBTInfo();

                console.log(ATC.value);
                // [DEBUG] logs
                console.log("\nSTATUS: Connection added!\n");
                FormControls.clearFormInput();
            }
        } else {
            console.log("No [INPUT] provided");
        }
    }

    // Clear form input
    static clearFormInput() {
        /** 
         * @name clearFormInput
         * @description Clear form input on form submission
         * @param None 
         * @returns {void}
         * */

        try {
            // Since the [MICRO-TASK QUEUE] considers indexedDB operations
            // to be of higher priority, using setTimeout will 
            // move this step up the [QUEUE]
            setTimeout(() => {
                HOST.value = ""
                DB.value = ""
                PORT.value = ""
                DBT_API_TOKEN.value = ""
                ATC.value = ""
            }, 1000);
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> FormControls.clearFormInput'
            );
        }
    }


    static validateURL(HOST_URL) {
        /** 
         * @name validateURL
         * @description Validate the provided [HOST] URL
         * @param {string} HOST_URL
         * @returns {boolean}
         * */

        /*  
            __Example URLs__
            
            "http://example.com/data.json",
            "https://example.com/data.xml",
            "http://example.com/data.csv",
            "http://example.com/notdata.txt",
            "docker://example.com/container",
            "postgresql://example.com/db",
            "mysql://example.com/db",
            "mariadb://example.com/db",
            "sqlite://example.com/db",
            "mongodb://example.com/db",
            "redis://example.com/db",
            "qdrant://example.com/db"
        */

        // Regular expression to match URLs pointing to data sources including SQL databases, Docker, and Qdrant
        const URL_PATTERN = /^(?:postgresql|mysql|mongodb|mssql|sqlite):\/\/[^\s/$.?#].[^\s]*$/;

        // Check URL pattern
        if (URL_PATTERN.test(HOST_URL)) {
            console.log(`${HOST_URL} is a valid [DATA SOURCE URL]`);
            return true;
        } else {
            console.log(`${HOST_URL} is NOT a valid [DATA SOURCE URL]`);
            return false;
        }
    }


    // Save connection
    static saveConnectionConfiguration() {
        /** 
         * @name saveConnectionConfiguration
         * @description Save the provided connection configuration
         * @param None
         * @returns {void} Update to return a [SESSION]
         * */

        // console.log(`\n__DEBUG MODE__\n${HOST.value}\n${DB.value}\n${PORT.value}\n\n`);
        // TODO -> Please remember to perform the [DbOperations] here

        FormControls.validateForm();
        event.preventDefault();
    }
}


// IndexedDB Operations
class DbOperations {

    static #DB_NAME = 'ec_store';
    static #dbConnection = null;

    // Open a connection
    static async openDBConnection() {
        /** 
         * @name openDBConnection
         * @description Open or Get an existing connection
         * @param None
         * @returns {IDBDatabase}
         * */

        if (!this.#dbConnection) {
            let dbVersion = await this.getNextDBVersion();
            this.#dbConnection = await new Promise((resolve, reject) => {
                let request = indexedDB.open(this.#DB_NAME, dbVersion);

                request.onsuccess = function (event) {
                    resolve(event.target.result);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };

                request.onupgradeneeded = function (event) {
                    let db = event.target.result;

                    // Perform any necessary updates to the database schema
                    if (!db.objectStoreNames.contains('config')) {
                        let objectStore = db.createObjectStore('config', { keyPath: 'id' });
                    }
                };
            });

            // [DEBUG] logs
            // console.log(this.#dbConnection);
        }
        return this.#dbConnection;
    }

    // Generate the next [DB_VERSION]
    static async getNextDBVersion() {
        /** 
         * @name getNextDBVersion
         * @description Increment the [DB_VERSION] by 1
         * @param None
         * @returns {Promise<void>}
         * */

        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.#DB_NAME);
            request.onsuccess = function () {
                let db = request.result;
                let version = db.version + 1;
                db.close();
                resolve(version);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    // Function to initialize object store
    static async h_INIT_OBJECT_STORE() {
        /** 
         * @name h_INIT_OBJECT_STORE
         * @description This [HANDLE] initializes object store
         * @param None
         * @returns {void}
         * */

        try {
            let dbConnection = await this.openDBConnection();
            let transaction = dbConnection.transaction(['config'], 'readwrite');
            let objectStore = transaction.objectStore('config');

            // Perform operations on the object store
            // For example, add, update, or delete data

            transaction.oncomplete = function () {
                console.log("Transaction completed successfully");
            };

            transaction.onerror = function (event) {
                console.error("Transaction error:", event.target.error);
            };
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> DbOperations.h_INIT_OBJECT_STORE'
            );
        }
    }

    // Function to delete object store
    static async h_EMPTY_OBJECT_STORE() {
        /** 
         * @name h_EMPTY_OBJECT_STORE
         * @description This [HANDLE] deletes object store
         * @param None - A value will be provided via the connection settings form
         * @returns {void}
         * */

        try {
            let dbConnection = await this.openDBConnection();
            let transaction = dbConnection.transaction(['config'], 'readwrite');
            let objectStore = transaction.objectStore('config');

            // Clear Object Store
            objectStore.clear();

            transaction.oncomplete = function () {
                console.log("Transaction completed successfully");
            };

            transaction.onerror = function (event) {
                console.error("Transaction error:", event.target.error);
            };

            dbConnection.close();
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> DbOperations.h_EMPTY_OBJECT_STORE'
            );
        }
    }

    // [ADD] data to [OBJECT STORE]
    static async h_ADD(USER_INFO) {
        /** 
         * @name h_ADD
         * @description This [HANDLE] adds [DATA] to an object store
         * @param None
         * @returns {void}
         * */

        try {
            let dbConnection = await this.openDBConnection();
            let transaction = dbConnection.transaction('config', 'readwrite');
            let objectStore = transaction.objectStore('config');

            // Define [CONFIG] structure
            let USER_CONFIG = {
                id: 'dbt_config',
                token: ENCODED_TOKEN,
                user_id: USER_INFO.id || '',
                user_name: USER_INFO.name || '',
                billing_email_address: USER_INFO.billing_email_address || '',
                run_duration_limit_seconds: USER_INFO.run_duration_limit_seconds || '',
                connection_type: SELECTED_CONNECTION_TYPE || '',
                analytics_tracking_code: ATC.value,
                created: new Date()
            };

            let request = objectStore.add(USER_CONFIG);

            request.onsuccess = function () {
                console.log('[USER] Configuration added to store', request.result);
            };

            transaction.oncomplete = function () {
                console.log('Transaction is complete');
            };

            request.onerror = function (event) {
                if (request.error.name == 'ConstraintError') {
                    console.log("\nObject with similar ID already exists\nAttempting to [UPDATE] configuration...\n");

                    // Attempt to [UPDATE] the existing [OBJECT]
                    DbOperations.h_UPDATE(USER_CONFIG);
                    event.preventDefault();
                } else {
                    console.log('Error', request.error);
                }
            };

            transaction.onabort = function () {
                console.log("Error", transaction.error);
            };
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> DbOperations.h_ADD'
            );
        }
    }

    // [UPDATE] data in [OBJECT STORE]
    static async h_UPDATE(UPDATED_PAYLOAD) {
        try {
            let dbConnection = await this.openDBConnection();
            let transaction = dbConnection.transaction('config', 'readwrite');
            let objectStore = transaction.objectStore('config');

            let request = objectStore.put(UPDATED_PAYLOAD);

            request.onsuccess = function () {
                console.log('Configuration [UPDATED] in store');
            };

            transaction.oncomplete = function () {
                console.log('Transaction is complete');
            };

            request.onerror = function (event) {
                console.log('An [ERROR] occurred when performing an [UPDATE]:', event.target.error);
            };

            transaction.onabort = function () {
                console.log("Error", transaction.error);
            };

        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRED] ${error}`,
                '[PROCESS] -> DbOperations.h_UPDATE'
            );
        }
    }


    // [DELETE] Database
    static h_DELETE_DATABASE() {
        /** 
         * @name h_DELETE_DATABASE
         * @description This [HANDLE] deletes a [DATABASE]
         * @param None
         * @returns {void}
         * */

        try {
            let deleteRequest = indexedDB.deleteDatabase('ec_store');
            console.log(`[DATABASE] -> deleted successfully`);
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRRED] ${error}`,
                '[PROCESS] -> DbOperations.h_DELETE_DATABASE'
            );
        }
    }

    // [RETRIEVE] data from [OBJECT STORE]
    static async h_RETRIEVE_INFO() {
        /** 
         * @name h_RETRIEVE_INFO
         * @description This [HANDLE] retrieves info from the [OBJECT STORE]
         * @param None
         * @returns {void}
         * */

        try {
            let dbConnection = await this.openDBConnection();
            let transaction = dbConnection.transaction('config', 'readonly');
            let objectStore = transaction.objectStore('config');

            let request = objectStore.get('dbt_config');

            request.onsuccess = function (event) {
                let userInfo = event.target.result;

                if (userInfo) {
                    // Set [OBJECT STORE DATA]
                    OBJECT_STORE_DATA = userInfo;


                    console.log('Retrieved [CONFIG]: ', OBJECT_STORE_DATA);
                } else {
                    console.log('[CONFIG] not found...');
                }
            };

            transaction.oncomplete = function () {
                console.log('Transaction is complete');
            };

            request.onerror = function (event) {
                console.log('Error retrieving [CONFIG]: ', event.target.error);
            };

            transaction.onabort = function () {
                console.log('Error', transaction.error);
            };

        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRRED] ${error}`,
                '[PROCESS] -> DbOperations.h_RETRIEVE_INFO'
            );
        }
    }
}

// Example [METHOD] calls
// DbOperations.h_INIT_OBJECT_STORE();
// DbOperations.h_ADD();
// DbOperations.h_UPDATE();
// DbOperations.h_EMPTY_OBJECT_STORE();
// DbOperations.h_DELETE_DATABASE();


// TODO -> Find out a way to update the DB_VERSION on every operation


// [DOCUMENTATION]
// Delete a book with the ID
// configOptions.delete('dbt_config');

// Abort [TRANSACTION] -> event => transaction.onabort
// transaction.abort();

// Delete everything
// configOptions.clear();
// console.log(configOptions.getAll());


class App {
    static async checkAndSetDefaultValues() {
        /** 
         * @name checkAndSetDefaultValues
         * @description Prepopulate [FORM] fields
         * @param None
         * @returns {void}
         * */

        try {
            let dbConnection = await DbOperations.openDBConnection();
            let transaction = dbConnection.transaction('config', 'readonly');
            let objectStore = transaction.objectStore('config');

            let request = objectStore.get('dbt_config');

            request.onsuccess = function (event) {
                let userInfo = event.target.result;
                if (userInfo) {
                    // If user info is found, set the values from the object store
                    HOST.value = userInfo.host || '';
                    DB.value = userInfo.db || '';
                    PORT.value = userInfo.port || '';
                } else {
                    // If no user info is found, set default placeholder values
                    HOST.placeholder = "Database URL...";
                    DB.placeholder = "Database Name...";
                    PORT.placeholder = "Port Number";
                }
            };

            transaction.oncomplete = function () {
                console.log('Transaction is complete');
            };

            request.onerror = function (event) {
                console.log('Error retrieving [OBJECT STORE DATA]:', event.target.error);
            };

            transaction.onabort = function () {
                console.log("Error", transaction.error);
            };
        } catch (error) {
            ErrorHandling.propagateError(
                `[AN ERROR OCCURRRED] ${error}`,
                '[PROCESS] -> App.checkAndSetDefaultValues'
            );
        }
    }
}

window.onload = function () {
    App.checkAndSetDefaultValues();
};


// The following section contains [UTILITY] methods
class Utils {
    static retrieveClassList(element_name) {
        /** 
         * @name retrieveClassList
         * @description Retrieve an element's classList
         * @param {Element} element_name
         * @returns {Array} element_classes_array
         * */

        let element_classes = element_name.classList;
        // Convert [DOMTokenList] to [Array]
        let element_classes_array = [...element_classes];

        // [DEBUG] logs
        console.log(element_classes_array);
        return element_classes_array;
    }

    static cssClassManager(element_name) {
        /** 
         * @name cssClassManager
         * @description Manage an element's classList
         * @param {Element} element_name
         * @returns {void}
         * */

        let class_array = Utils.retrieveClassList(element_name);

        // Remove the <active> class from unselected list elements
        const element_list = document.querySelectorAll('.connection-type');

        element_list.forEach(item => {
            if (item !== element_name) {
                item.classList.remove('active');
            }
        });

        // Check if the [ELEMENT]'s classList contains the <active> class
        if (class_array.includes('active')) {
            element_name.classList.remove('active');
        } else {
            element_name.classList.add('active');
        }
    }
}

