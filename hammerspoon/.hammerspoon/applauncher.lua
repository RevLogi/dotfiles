local key2app = {
	s = "Safari",
	k = "kitty",
	o = "Obsidian",
	w = "WeChat",
	n = "Notes",
	t = "Typora",
	p = "Preview",
	v = "Visual Studio Code",
	m = "MiaoYan",
	c = "ChatGPT",
}

for key, app in pairs(key2app) do
	hs.hotkey.bind({ "alt" }, key, function()
		hs.application.launchOrFocus(app)
	end)
end

local hs = hs
