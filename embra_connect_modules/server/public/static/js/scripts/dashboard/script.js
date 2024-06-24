const PROFILE_NAME = document.querySelector(".profile-link");

////////////////////////////////////////////////
///////////// <utility> classes ////////////////
////////////////////////////////////////////////
class Notifications {
  static displayToasterMessage(message) {
    /**
     * @name displayToasterMessage
     * @description Display <toaster> messages.
     * @param {string} message
     * @returns {Promise<void>}
     * */

    Toastify({
      text: `${message}`,
      duration: 3000,
      newWindow: true,
      close: false,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#f38041",
        color: "#ffffff",
        borderRadius: "9px 21px 64px 32px",
        fontWeight: "300",
        letterSpacing: "1.4px",
        textTransform: "capitalize",
        boxShadow: "0 1rem 1rem 0 rgba(0, 0, 0, .1)",
      },
      // Handle callback after click.
      onClick: function () {},
    }).showToast();
  }
}

/////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

// [DATA] retrieved from the [OBJECT STORE]
let OBJECT_STORE_DATA;

/////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////
class DbOperations {
  static #DB_NAME = "ec_store";
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
          if (!db.objectStoreNames.contains("config")) {
            let objectStore = db.createObjectStore("config", { keyPath: "id" });
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
}

// This class handles [DASHBOARD] operations
class Dashboard {
  // [RETRIEVE] data from [OBJECT STORE]
  static async h_RETRIEVE_INFO() {
    /**
     * @name h_RETRIEVE_INFO
     * @description This [HANDLE] retrieves info from the [OBJECT STORE]
     * @param None
     * @returns {void}
     * */

    try {
      let dbConnection = await DbOperations.openDBConnection();
      let transaction = dbConnection.transaction("config", "readonly");
      let objectStore = transaction.objectStore("config");

      let request = objectStore.get("dbt_config");

      request.onsuccess = function (event) {
        let userInfo = event.target.result;

        if (userInfo) {
          // Set [OBJECT STORE DATA]
          OBJECT_STORE_DATA = userInfo;

          console.log("Retrieved [CONFIG]: ", OBJECT_STORE_DATA);
        } else {
          console.log("[CONFIG] not found...");
        }
      };

      transaction.oncomplete = function () {
        console.log("Transaction is complete");
      };

      request.onerror = function (event) {
        console.log("Error retrieving [CONFIG]: ", event.target.error);
      };

      transaction.onabort = function () {
        console.log("Error", transaction.error);
      };
    } catch (error) {
      ErrorHandling.propagateError(
        `[AN ERROR OCCURRRED] ${error}`,
        "[PROCESS] -> DbOperations.h_RETRIEVE_INFO",
      );
    }
  }

  static populateDashboard() {
    // TODO -> Populate dashboard with API content
  }
}

Dashboard.h_RETRIEVE_INFO();

window.addEventListener("load", function () {
  Notifications.displayToasterMessage("Generating Summary");
});
