-- ============================================================
-- Language Tool: Text Refinement using LLMs
-- ============================================================
-- Requires: config.lua in ~/.hammerspoon/
-- API keys: Set in .env file or environment variables

local configPath = hs.configdir .. "/config.lua"

-- Load config
local config = {}
local ok, err = pcall(function()
	config = dofile(configPath)
end)

if not ok or not config.providers then
	hs.alert.show("Error loading config.lua!\n" .. (err or "File not found"))
	return
end

-- Helper: Load API key from .env file or environment
local function loadApiKey(envKey)
	local envFile = os.getenv("HOME") .. "/.env"
	local file = io.open(envFile, "r")
	if file then
		for line in file:lines() do
			local value = line:match("^" .. envKey .. "=(.+)$")
			if value then
				value = value:match("^%s*(.-)%s*$")
				value = value:gsub("^['\"]", ""):gsub("['\"]$", "")
				file:close()
				return value
			end
		end
		file:close()
	end
	return os.getenv(envKey)
end

-- Helper: Get enabled provider
local function getProvider(name)
	local p = config.providers[name]
	if not p or not p.enabled then
		return nil
	end

	local apiKey = loadApiKey(p.env_key)
	if not apiKey then
		hs.alert.show(p.name .. " API key not found!\nSet " .. p.env_key .. " in .env")
		return nil
	end

	return {
		name = p.name,
		endpoint = p.endpoint,
		model = p.model,
		apiKey = apiKey,
	}
end

-- Helper: Build request body based on provider
local function buildRequestBody(provider, model, systemPrompt, userText, temperature)
	local body = {}

	if provider == "minimax" then
		body = {
			model = model,
			messages = {
				{ role = "system", content = systemPrompt },
				{ role = "user", content = userText },
			},
			temperature = temperature,
		}
	else
		-- GLM and other OpenAI-compatible providers
		body = {
			model = model,
			messages = {
				{ role = "system", content = systemPrompt },
				{ role = "user", content = userText },
			},
			temperature = temperature,
		}
	end

	return body
end

-- Helper: Extract refined text from response
local function extractResponse(provider, responseBody)
	local data = hs.json.decode(responseBody)

	if provider == "minimax" then
		return data.choices[1].message.content
	else
		-- GLM and OpenAI-compatible
		return data.choices[1].message.content
	end
end

-- Main: Refine text function
local function refineText(providerName)
	local providerCfg = providerName or config.refine.default_provider or "glm"

	local provider = getProvider(providerCfg)
	if not provider then
		return
	end

	local currentElement = hs.uielement.focusedElement()
	local selectedText = nil

	if currentElement then
		selectedText = currentElement:selectedText()
	end

	if not selectedText or selectedText == "" then
		hs.eventtap.keyStroke({ "cmd" }, "c")
		hs.timer.usleep(50000)
		selectedText = hs.pasteboard.getContents()
	end

	if not selectedText then
		hs.alert.show("No text selected!")
		return
	end

	if config.refine.show_alerts then
		hs.alert.show("Refining with " .. provider.name .. "...")
	end

	local body = buildRequestBody(
		providerName,
		config.providers[providerCfg].model,
		config.refine.system_prompt,
		selectedText,
		config.refine.temperature
	)

	local headers = {
		["Content-Type"] = "application/json",
		["Authorization"] = "Bearer " .. provider.apiKey,
	}

	-- Add Minimax-specific headers
	if providerName == "minimax" then
		headers["Authorization"] = "Bearer " .. provider.apiKey
	end

	hs.http.asyncPost(provider.endpoint, hs.json.encode(body), headers, function(code, responseBody, _)
		if code == 200 then
			local ok, refinedText = pcall(extractResponse, providerName, responseBody)
			if ok and refinedText then
				refinedText = refinedText:gsub("^%s*(.-)%s*$", "%1")
				hs.pasteboard.setContents(refinedText)
				hs.eventtap.keyStroke({ "cmd" }, "v")
			else
				hs.alert.show("Failed to parse response")
			end
		else
			print("API Error (" .. provider.name .. "): " .. responseBody)
			hs.alert.show("API Error: " .. code)
		end
	end)
end

-- Bind hotkey from config
local hotkeyCfg = config.refine.hotkey or { modifiers = { "alt" }, key = "r" }
hs.hotkey.bind(hotkeyCfg.modifiers, hotkeyCfg.key, function()
	refineText(config.refine.default_provider)
end)

-- Also bind alt+1, alt+2, etc. for switching providers
local i = 1
for name, _ in pairs(config.providers) do
	if config.providers[name].enabled then
		hs.hotkey.bind({ "alt" }, tostring(i), function()
			refineText(name)
		end)
		i = i + 1
	end
end
