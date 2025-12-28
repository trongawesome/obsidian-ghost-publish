import { SettingsProp } from "./../types/index";
import { MarkdownView, Notice } from "obsidian";
import { publishSinglePost } from "./publishSinglePost";

export const publishPost = async (
	view: MarkdownView,
	settings: SettingsProp
) => {
	const file = view.app.workspace.getActiveFile();
	if (!file) {
		new Notice("No file is open");
		return;
	}

	const result = await publishSinglePost(file, settings, view.app);

	// Show notices (existing UX)
	if (result.success) {
		new Notice(
			`"${result.title}" has been ${result.status} successful!`
		);
	} else {
		new Notice(result.error || "An error occurred while publishing");
	}
};
