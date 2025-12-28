export interface SettingsProp {
	url: string;
	adminToken: string;
	debug: boolean
}

export const DEFAULT_SETTINGS: SettingsProp = {
	url: "",
	adminToken: "",
	debug: false
};

export interface ContentProp {
	title: string;
	tags?: string[];
	featured?: boolean;
	status: string;
	excerpt?: string | undefined;
	feature_image?: string;
}

export interface DataProp {
	content: string;
}

export interface PublishResult {
	success: boolean;
	fileName: string;
	title?: string;
	status?: "published" | "draft";
	error?: string;
}

export interface BatchPublishSummary {
	total: number;
	successful: number;
	failed: number;
	results: PublishResult[];
}
