"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromDigitalOceanAWS = exports.uploadToDigitalOceanAWS = void 0;
/* eslint-disable no-console */
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
const s3Client = new client_s3_1.S3Client({
    region: 'us-east-1', // Set any valid region
    endpoint: `${process.env.DO_SPACE_ENDPOINT}`,
    credentials: {
        accessKeyId: `${process.env.DO_SPACE_ACCESS_KEY}`,
        secretAccessKey: `${process.env.DO_SPACE_SECRET_KEY}`,
    },
});
const uploadToDigitalOceanAWS = (
// eslint-disable-next-line no-undef
file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure the file exists before uploading
        yield fs_1.default.promises.access(file.path, fs_1.default.constants.F_OK);
        const fileStream = fs_1.default.createReadStream(file.path);
        // Prepare the upload command
        const command = new client_s3_1.PutObjectCommand({
            Bucket: `${process.env.DO_SPACE_BUCKET}`,
            Key: `${file.originalname}`,
            Body: fileStream,
            ACL: 'public-read',
            ContentType: file.mimetype,
        });
        // Execute the upload
        yield s3Client.send(command);
        // Construct the direct URL to the uploaded file
        const Location = `${process.env.DO_SPACE_ENDPOINT}/${process.env.DO_SPACE_BUCKET}/${file.originalname}`;
        return { Location };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error uploading file: ${file.path}`, error);
        throw error;
    }
});
exports.uploadToDigitalOceanAWS = uploadToDigitalOceanAWS;
const deleteFromDigitalOceanAWS = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the file key from the URL
        const key = fileUrl.replace(`${process.env.DO_SPACE_ENDPOINT}/${process.env.DO_SPACE_BUCKET}/`, '');
        // Prepare the delete command
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: `${process.env.DO_SPACE_BUCKET}`,
            Key: key,
        });
        // Execute the delete command
        yield s3Client.send(command);
        console.log(`Successfully deleted file: ${fileUrl}`);
    }
    catch (error) {
        console.error(`Error deleting file: ${fileUrl}`, error);
        throw new Error(`Failed to delete file: ${error === null || error === void 0 ? void 0 : error.message}`);
    }
});
exports.deleteFromDigitalOceanAWS = deleteFromDigitalOceanAWS;
