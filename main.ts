import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { createDailyNote, getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

// Copy text (selected or line under cursor) to daily note
const addTaskToDate = async (editor: Editor, date: moment.Moment) => {
	// Get text to copy
	let task: string
	if (editor.somethingSelected()) {
		task = editor.getSelection()
	} else {
		let cursor = editor.getCursor()
		task = editor.getLine(cursor.line)
	}

	// Get daily note
	let notes = getAllDailyNotes();
	let file = getDailyNote(date, notes);
	if (!file) {
		file = await createDailyNote(date);
	}

	file.vault.append(file, task + '\n')
}

const getTasksInFile = (editor: Editor): string[] => {
	const regex = /^\s*- \[ \]/;
	const lines = Array(editor.lineCount()).fill(null).map((_, i) => editor.getLine(i))
	return lines.filter(line => line && regex.test(line))
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();


		this.addCommand({
			id: 'add-task-today',
			name: 'Add Task to Today',
			editorCallback: (editor: Editor) => addTaskToDate(editor, moment()),
		});

		this.addCommand({
			id: 'add-task-tomorrow',
			name: 'Add Task to Tomorrow',
			editorCallback: (editor: Editor) => addTaskToDate(editor, moment().add(1, "day")),
		});

		// Tutorial stuff after this

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'select-tasks-in-file',
			name: 'Select Tasks in File',
			editorCallback: async (editor: Editor) => {
				const tasks = getTasksInFile(editor);
				const items: string[] = await new Promise((resolve, reject) => {
					new SvelteModal(this.app, resolve, tasks).open();
				})
				console.log(`Here with ${items}`)
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

import { mount, unmount } from 'svelte'
import Component from './component.svelte'
type SubmitFuc = (list: string[]) => void;

class SvelteModal extends Modal {
	component: any
	submit: SubmitFuc
	items: string[]

	constructor(app: App, submit: SubmitFuc, items: string[]) {
		super(app);
		this.submit = (list: string[]) => {
			submit(list)
			this.close();
		}
		this.items = items;
	}

	onOpen() {
		this.component = mount(Component, {
			target: this.contentEl,
			props: {
				submit: this.submit,
				items: this.items
			}
		})
	}

	onClose() {
		if (this.component) {
			unmount(this.component)
		}
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
