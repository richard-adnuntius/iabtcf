import { GetJSON } from './GetJSON';
import { GVLError } from './GVLError';
/**
 * @class
 */
class GVL {
    /**
     * @param {(string | object | number)} [versionOrJSON] - can be either the
     * JSON object that is the GVL or a version number represented as a string or
     * number to download.  If nothing is passed the latest version of the GVL
     * will be loaded
     *
     * @return {undefined}
     */
    constructor(versionOrJSON) {
        if (!GVL.baseUrl) {
            GVL.baseUrl = GVL.DEFAULT_BASE_URL;
        }
        if (!GVL.filename) {
            GVL.filename = GVL.DEFAULT_FILENAME;
        }
        let url = GVL.baseUrl;
        /**
         * figure out if they passed in a version to download, a GVL JSON object
         * or nothing.
         */
        switch (typeof versionOrJSON) {
            case 'string':
            case 'number':
                // download the version specified
                if (versionOrJSON > 0) {
                    url += 'v-' + versionOrJSON + '/' + GVL.filename;
                    this.readyPromise = GetJSON.get(url);
                }
                else {
                    throw new GVLError('invalid vendor list version');
                }
                break;
            case 'object':
                // they have passed a GVL JSON
                this.readyPromise = new Promise((resolve) => {
                    versionOrJSON = versionOrJSON;
                    resolve(versionOrJSON);
                });
                break;
            default:
                // anything else we just get the latest
                url += GVL.filename;
                this.readyPromise = GetJSON.get(url);
        }
        this.readyPromise.then((gvlJson) => {
            this.json = gvlJson;
        })
            .catch((err) => {
            throw new GVLError('unable to construct GVL Object' + err);
        });
    }
    /**
     * setBaseUrl - if the default GVL location isn't used this will be used
     *
     * @static
     *
     * @param {string} newUrl - new full base URL before the filename or the
     * versioned source url, defined by the TCF as
     * [baseUrl]/v-[versionNum]/[filename] default baseUrl is
     * 'https://vendorlist.consensu.org/'
     *
     * @return {undefined}
     */
    static setBaseUrl(newUrl) {
        // incase they forgot the trailing slash...
        newUrl += (newUrl[newUrl.length - 1] === '/') ? '' : '/';
        this.baseUrl = newUrl;
    }
    /**
     * setFilename - sets the filename in case it's different that just
     * vendorlist.json otherwise the default will be used of vendorlist.json
     *
     * @static
     * @param {string} newFilename - value other than vendorlist.json
     * @return {undefined}
     */
    static setFilename(newFilename) {
        this.filename = newFilename;
    }
    /**
     * getVersion - returns the version specified by the Global Vendor List as
     * vendorListVersion
     *
     * @return {number}
     */
    getVersion() {
        return this.json.vendorListVersion;
    }
    /**
     * getPurpose - returns a single purpose by purpose id
     *
     * @param {number} purposeId - purpose id to return
     * @return {object}
     */
    getPurpose(purposeId) {
        // purposes are sorted with no gaps but are 1-based instead of 0-based
        // like the array is
        return this.json.purposes[purposeId - 1];
    }
    /**
     * getPurposes returns the purposes array from the GVL which contains their
     * descriptions, names and ids.
     *
     * @return {array}
     */
    getPurposes() {
        return this.json.purposes;
    }
    /**
     * getVendors returns the vendors array from the global vendor list
     *
     * @return {undefined}
     */
    getVendors() {
        return this.json.vendors;
    }
    /**
     * getVendor returns a single vendor object by vendor id from the GVL
     *
     * @param {number} vendorId - vendor id to pull from the GVL
     * @return {object}
     */
    getVendor(vendorId) {
        return this.json.vendors[vendorId];
    }
    /**
     * getReadyPromise - gets the promise object for when the GVL downloads and
     * this object is ready to operate.
     *
     * @return {Promise} - standard es6 promise object
     */
    getReadyPromise() {
        return this.readyPromise;
    }
}
GVL.DEFAULT_BASE_URL = 'https://vendorlist.consensu.org/';
GVL.DEFAULT_FILENAME = 'vendorlist.json';
export { GVL };