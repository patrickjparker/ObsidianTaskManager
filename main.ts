import { App, Editor, Modal, Notice, Plugin } from 'obsidian';
import moment from 'moment'

import { createDailyNote, getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';

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

	addLinesToDate([task], date);
}

const addLinesToDate = async (tasks: string[], date: moment.Moment) => {
	// Get daily note
	let notes = getAllDailyNotes();
	let file = getDailyNote(date, notes);
	if (!file) {
		file = await createDailyNote(date);
	}

	for (let task of tasks) {
		file.vault.append(file, task + '\n')
	}
}

const getTasksInFile = (editor: Editor): string[] => {
	const regex = /^\s*- \[ \]/;
	const lines = Array(editor.lineCount()).fill(null).map((_, i) => editor.getLine(i))
	return lines.filter(line => line && regex.test(line))
}

const selectTasksInFile = (editor: Editor, app: App, target: string): Promise<string[]> => {
	const tasks = getTasksInFile(editor);
	if (tasks.length === 0) {
		new Notice("There are no tasks in this file")
		return Promise.resolve([]);
	}
	return new Promise((resolve, _) => {
		new SvelteModal(app, resolve, tasks, target).open();
	})
}

export default class MyPlugin extends Plugin {

	async onload() {

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

		// Take tasks from a file and add to a daily note
		this.addCommand({
			id: 'select-tasks-in-file-for-today',
			name: 'Select Tasks for Today',
			editorCallback: async (editor: Editor) => {
				const tasks = await selectTasksInFile(editor, this.app, "today's tasks");
				if (tasks.length > 0) {
					addLinesToDate(tasks, moment());
				}
			}
		});

		this.addCommand({
			id: 'select-tasks-in-file-for-tomorrow',
			name: 'Select Tasks for Tomorrow',
			editorCallback: async (editor: Editor) => {
				const tasks = await selectTasksInFile(editor, this.app, "tomorrow's tasks");
				if (tasks.length > 0) {
					addLinesToDate(tasks, moment());
				}
			}
		});

	}

	onunload() {

	}

}

import { mount, unmount } from 'svelte'
import Component from './component.svelte'

type SubmitFuc = (list: string[]) => void;

class SvelteModal extends Modal {
	component: any
	submit: SubmitFuc
	items: string[]
	target: string

	constructor(app: App, submit: SubmitFuc, items: string[], target: string) {
		super(app);
		this.submit = (list: string[]) => {
			submit(list)
			this.close();
		}
		this.items = items;
		this.target = target;
	}

	onOpen() {
		this.component = mount(Component, {
			target: this.contentEl,
			props: {
				submit: this.submit,
				items: this.items,
				target: this.target
			}
		})
	}

	onClose() {
		if (this.component) {
			unmount(this.component)
		}
	}
}
