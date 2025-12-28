/* eslint-disable @typescript-eslint/no-var-requires */
import { SettingsProp, ContentProp, DataProp, PublishResult } from "./../types/index";
import { App, TFile, requestUrl } from "obsidian";
import { sign } from "jsonwebtoken";

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt();
const version = "v4";

const contentPost = (frontmatter: ContentProp, data: DataProp) => ({
	posts: [
		{
			...frontmatter,
			html: md.render(data.content),
		},
	],
});

export const publishSinglePost = async (
	file: TFile,
	settings: SettingsProp,
	app: App
): Promise<PublishResult> => {
	try {
		// Validate API key
		const key = settings.adminToken;
		if (!key.includes(":")) {
			return {
				success: false,
				fileName: file.basename,
				error: "Error: Ghost API Key is invalid."
			};
		}

		const [id, secret] = key.split(":");

		// Create the token (including decoding secret)
		const token = sign({}, Buffer.from(secret, "hex"), {
			keyid: id,
			algorithm: "HS256",
			expiresIn: "5m",
			audience: `/${version}/admin/`,
		});

		// Get frontmatter from metadata cache
		const metaMatter = app.metadataCache.getFileCache(file)?.frontmatter;

		// Read file content
		const fileContent = await app.vault.read(file);
		const data = matter(fileContent);

		const frontmatter = {
			title: metaMatter?.title || file.basename,
			tags: metaMatter?.tags || [],
			featured: metaMatter?.featured || false,
			status: metaMatter?.published ? "published" : "draft",
			excerpt: metaMatter?.excerpt || undefined,
			feature_image: metaMatter?.feature_image || undefined,
		};

		const post = JSON.stringify(contentPost(frontmatter, data));

		if (settings.debug === true) {
			console.log("Request: " + post);
		}

		const result = await requestUrl({
			url: `${settings.url}/ghost/api/${version}/admin/posts/?source=html`,
			method: "POST",
			contentType: "application/json",
			headers: {
				"Access-Control-Allow-Methods": "POST",
				"Content-Type": "application/json;charset=utf-8",
				Authorization: `Ghost ${token}`,
			},
			body: post
		});

		const json = result.json;

		if (settings.debug === true) {
			console.log(JSON.stringify(json));
		}

		if (json?.posts) {
			return {
				success: true,
				fileName: file.basename,
				title: json.posts[0].title,
				status: json.posts[0].status
			};
		} else {
			const errorMessage = json.errors?.[0]?.context || json.errors?.[0]?.message || "Unknown error";
			const errorDetails = json.errors?.[0]?.details?.[0]?.message;
			const fullError = errorDetails
				? `${errorMessage} - ${errorDetails}`
				: errorMessage;

			return {
				success: false,
				fileName: file.basename,
				error: fullError
			};
		}
	} catch (error: any) {
		return {
			success: false,
			fileName: file.basename,
			error: `Couldn't connect to the Ghost API. Is the API URL and Admin API Key correct?\n\n${error.name}: ${error.message}`
		};
	}
};
