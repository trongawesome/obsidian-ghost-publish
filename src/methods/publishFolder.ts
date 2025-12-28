import { App, Notice, TFile } from "obsidian";
import { SettingsProp, PublishResult } from "./../types/index";
import { publishSinglePost } from "./publishSinglePost";
import { BatchPublishModal } from "../modals/BatchPublishModal";

export const publishFolder = async (
	app: App,
	settings: SettingsProp
) => {
	// Validate active file
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		new Notice("Please open a note in the folder you want to publish.");
		return;
	}

	// Find all .md files in the folder
	const folder = activeFile.parent;
	if (!folder) {
		new Notice("Could not determine the folder of the active file.");
		return;
	}

	const filesInFolder = folder.children.filter(
		(file): file is TFile => file instanceof TFile && file.extension === "md"
	);

	// Handle edge cases
	if (filesInFolder.length === 0) {
		new Notice("No markdown files found in this folder.");
		return;
	}

	if (filesInFolder.length === 1) {
		new Notice("Only one markdown file found in this folder. Use 'Send to Ghost' for single files.");
		return;
	}

	// Show confirmation modal
	const modal = new BatchPublishModal(
		app,
		filesInFolder,
		() => performBatchPublish(filesInFolder, settings, app)
	);
	modal.open();
};

async function performBatchPublish(
	files: TFile[],
	settings: SettingsProp,
	app: App
) {
	const results: PublishResult[] = [];
	const totalFiles = files.length;

	new Notice(`Starting batch publish of ${totalFiles} files...`, 3000);

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		try {
			const result = await publishSinglePost(file, settings, app);
			results.push(result);

			// Show progress notice
			if (result.success) {
				new Notice(`[${i + 1}/${totalFiles}] Published: ${file.basename}`, 2000);
			} else {
				new Notice(`[${i + 1}/${totalFiles}] Failed: ${file.basename}`, 2000);
			}
		} catch (error: any) {
			results.push({
				success: false,
				fileName: file.basename,
				error: error.message
			});
			new Notice(`[${i + 1}/${totalFiles}] Error: ${file.basename}`, 2000);
		}
	}

	// Show summary
	showBatchSummary(results, settings);
}

function showBatchSummary(results: PublishResult[], settings: SettingsProp) {
	const successes = results.filter(r => r.success);
	const failures = results.filter(r => !r.success);

	if (failures.length === 0) {
		new Notice(
			`Successfully published all ${successes.length} posts to Ghost!`,
			5000
		);
	} else if (successes.length === 0) {
		new Notice(
			`Failed to publish all ${failures.length} posts.\n` +
			`Failed files: ${failures.map(f => f.fileName).join(", ")}`,
			8000
		);
	} else {
		new Notice(
			`Published ${successes.length}/${results.length} posts.\n` +
			`Failed: ${failures.map(f => f.fileName).join(", ")}`,
			8000
		);
	}

	// Log detailed errors to console if debug mode is enabled
	if (settings.debug && failures.length > 0) {
		console.error("Batch publish failures:", failures);
	}
}
