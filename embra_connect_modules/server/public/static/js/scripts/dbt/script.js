// Selectors
// [FORM] input
const HOST = document.getElementById("url");
const DB = document.getElementById("db");
const PORT = document.getElementById("port");
const ATC = document.getElementById("analytics-tracking-code");

// [CONNECTION TYPES]
const AVAILABLE_CONNECTION_TYPES = Object.freeze({
  POSTGRES: 1,
  DBT: 2,
  AWS: 3,
});

const postgres_selector = document.querySelector(".postgres");
const mssql_selector = document.querySelector(".mssql");
const mysql_selector = document.querySelector(".mysql");
const aws_selector = document.querySelector(".aws");
const dbt_selector = document.querySelector(".dbt");

// Depending on what the user has selected
let SELECTED_CONNECTION_TYPE;

// NOTE -> The [DBT_API_TOKEN] should be provided by the user
// The credentials can be configured on the <connection> page
// The [DBT_SERVICE] will return a [FAIL] status in case the [TOKEN] is INVALID
const DBT_SERVICE_URL = "http://localhost:3000/dbt";
const DBT_API_TOKEN = document.getElementById("token");

// Consume the [ENCODED] token istead
let ENCODED_TOKEN;

const SAVE_BUTTON = document.getElementById("save-button");

// [DATA] retrieved from the [OBJECT STORE]
let OBJECT_STORE_DATA;

////////////////////////////////////////////////
///////////// <utility> classes ////////////////
// This class performs [GENERIC] ERROR handling
////////////////////////////////////////////////
class ErrorHandling {
  static propagateError(message, process) {
    Notifications.displayToasterMessage(message);

    console.error(`
            [AN ERROR OCCURRED]
            [MESSAGE] -> ${message}
            [PROCESS] -> ${process}
        `);
  }
}

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
          token: DBT_API_TOKEN.value,
        },
        // Handle [serialization]
        get encodedUrl() {
          let hexToken = Array.from(this.readonly.token)
            .map((c) => c.charCodeAt(0).toString(16))
            .join("");
          let encodedToken = encodeURIComponent(hexToken);

          // Set [GLOBAL] value for the [ENCODED] token
          ENCODED_TOKEN = encodedToken;

          // Return formatted [URL]
          return this.readonly.url + "?token=" + encodedToken;
        },
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
        "[PROCESS] -> FormControls.getDBTInfo"
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
        SELECTED_CONNECTION_TYPE = "POSTGRES";

        Utils.cssClassManager(postgres_selector);
        console.log("Selected connection type:", SELECTED_CONNECTION_TYPE);
        break;
      case AVAILABLE_CONNECTION_TYPES.DBT:
        SELECTED_CONNECTION_TYPE = "DBT Cloud";

        Utils.cssClassManager(dbt_selector);
        console.log("Selected connection type:", SELECTED_CONNECTION_TYPE);
        break;
      case AVAILABLE_CONNECTION_TYPES.AWS:
        SELECTED_CONNECTION_TYPE = "AWS";

        Utils.cssClassManager(aws_selector);
        console.log("Selected connection type:", SELECTED_CONNECTION_TYPE);
        break;
      default:
        break;
    }
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
    if (
      HOST.value.length > 0 &&
      DB.value.length > 0 &&
      PORT.value.length > 0 &&
      DBT_API_TOKEN.value.length > 0
    ) {
      if (FormControls.validateURL(HOST.value)) {
        // Persist [CONNECTION] configuration to [EC_SECRETS_MANAGER] as ENVIRONMENT variables that can be accessed by existing services

        FormControls.getDBTInfo();

        console.log(ATC.value);
        // [DEBUG] logs
        console.log("\nSTATUS: Connection added!\n");
        Notifications.displayToasterMessage(
          "Your connection settings have been updated successfully."
        );
        FormControls.clearFormInput();
      }
    } else {
      console.log("No [INPUT] provided");
      Notifications.displayToasterMessage("Please fill all required fields.");
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
        HOST.value = "";
        DB.value = "";
        PORT.value = "";
        DBT_API_TOKEN.value = "";
        ATC.value = "";
      }, 1000);
    } catch (error) {
      ErrorHandling.propagateError(
        `[AN ERROR OCCURRED] ${error}`,
        "[PROCESS] -> FormControls.clearFormInput"
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
    const URL_PATTERN =
      /^(?:postgresql|mysql|mongodb|mssql|sqlite):\/\/[^\s/$.?#].[^\s]*$/;

    // Check URL pattern
    if (URL_PATTERN.test(HOST_URL)) {
      console.log(`${HOST_URL} is a valid [DATA SOURCE URL]`);
      return true;
    } else {
      console.log(`${HOST_URL} is NOT a valid [DATA SOURCE URL]`);
      Notifications.displayToasterMessage(
        "Please provide a valid Data Source URL."
      );
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

    event.preventDefault();
  }
}

class App {
  static async checkAndSetDefaultValues() {
    /**
     * @name checkAndSetDefaultValues
     * @description Prepopulate [FORM] fields
     * @param None
     * @returns {void}
     * */

    try {
      console.log("Unimplemented!");
    } catch (error) {
      ErrorHandling.propagateError(
        `[AN ERROR OCCURRRED] ${error}`,
        "[PROCESS] -> App.checkAndSetDefaultValues"
      );
    }
  }
}

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
    const element_list = document.querySelectorAll(".connection-type");

    element_list.forEach((item) => {
      if (item !== element_name) {
        item.classList.remove("active");
      }
    });

    // Check if the [ELEMENT]'s classList contains the <active> class
    if (class_array.includes("active")) {
      element_name.classList.remove("active");
    } else {
      element_name.classList.add("active");
    }
  }
}
