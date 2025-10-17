/**
 * @param {string} message - text
 * @param {string} [type="info"] - "success" | "error" | "info" | "warning"
 * @param {number} [duration=3000] - how long its visible (ms)
 */

(function() {
	const container = document.createElement("div");
	container.id = "global-notify-container";
	document.body.appendChild(container);
	window.notify = function(message, type = "info", duration = 3000) {
		const note = document.createElement("div");
		note.className = `notify ${type}`;
		note.textContent = message;
		container.appendChild(note);
		requestAnimationFrame(() => note.classList.add("show"));
		setTimeout(() => {
			note.classList.remove("show");
			setTimeout(() => note.remove(), 300);
		}, duration);
	};
})();
