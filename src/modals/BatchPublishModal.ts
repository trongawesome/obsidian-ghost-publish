import { App, Modal, TFile } from "obsidian";

export class BatchPublishModal extends Modal {
	files: TFile[];
	onConfirm: () => void;

	constructor(app: App, files: TFile[], onConfirm: () => void) {
		super(app);
		this.files = files;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;

		// Title
		contentEl.createEl("h2", { text: "Publish Folder to Ghost" });

		// File count summary
		contentEl.createEl("p", {
			text: `Found ${this.files.length} markdown file${this.files.length === 1 ? '' : 's'} in this folder:`
		});

		// File list (scrollable container)
		const listContainer = contentEl.createDiv({ cls: "batch-publish-file-list" });
		const ul = listContainer.createEl("ul");

		this.files.forEach(file => {
			ul.createEl("li", { text: file.basename });
		});

		// Button container
		const buttonContainer = contentEl.createDiv({ cls: "batch-publish-buttons" });

		// Confirm button
		const confirmBtn = buttonContainer.createEl("button", {
			text: `Publish ${this.files.length === 1 ? 'File' : 'All'}`,
			cls: "mod-cta"
		});
		confirmBtn.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});

		// Cancel button
		const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
		cancelBtn.addEventListener("click", () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
