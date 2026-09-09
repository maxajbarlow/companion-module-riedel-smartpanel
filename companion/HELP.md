# Riedel Smart Panel Companion Module

This module allows you to control Riedel Smart Panels from Bitfocus Companion.

This module has been tested with RSP-1216HL and RSP-1232HL but should work with the desktop panels too.

## Requirements

**Minimum Firmware Version**: 2.0.0 or higher

This module requires the panel to be running firmware version 2.0.0 or later. Earlier firmware versions may not support the WebSocket API used by this module.

## Configuration

### Connection Settings

## Configuration

| Setting          | Description                                              | Default |
| ---------------- | -------------------------------------------------------- | ------- |
| Device           | Devices discovered automatically via Bonjour (or Manual) | -       |
| Panel IP Address | IP address of the Smart Panel (e.g., 192.168.0.1)        | -       |
| WebSocket Port   | WebSocket port (usually 80)                              | 80      |

## Supported Actions

### Network Configuration

- **Set IP Address**: Change the IP address of a network interface
  - Interface: Config1, Media1, or Media2
  - IP Address: New IP address
  - Subnet Mask: Network mask
  - Gateway: Default gateway
  - DHCP: Enable/disable DHCP

### Device Control

- **Reboot Device**: Restart the panel
- **Identify Device**: Identify the panel

### Device Health & Information

- **Fetch Device Info**: Get device information
- **Fetch Network Status**: Get current network status
- **Health & Alarms**: Monitor health status, active alarms, and alarm history

### Application Control

- **PTP (Precision Time Protocol)**: View and configure PTP settings (domain, hybrid mode, receiver-only mode)
- **Control Panel**: Enable/disable/toggle the Control Panel Application (intercom functionality)
- **NMOS**: Enable/disable/toggle NMOS functionality

### Key Control & Mute

- **Toggle Mute on Key**: Simulates a rotary encoder push on a key to toggle mute on the connected panel or expansion panels.
  - **Panel**: Target Master Panel (Panel 0) or attached Expansion Panels 1–4 (ESP-1216HL).
  - **Key Number**: Key number 1–32 (supports Companion variables).
  - **Press Hold Duration**: Duration to hold the push (default 250ms; minimum 200ms required by panel firmware).
- **Toggle Mute on Key (Custom IP)**: Target any panel IP address directly on the fly.
- **Set Key Mute (state-aware)**: Set a key **Muted** or **Unmuted** (or Toggle). Reads the panel's real mute state and only actuates when it differs — so pressing twice won't undo itself, and it's safe to fire repeatedly. Requires _Monitor mute state_.
- **Set Mute on Multiple Keys (state-aware)**: Mute/unmute a whole set in **one** action — `1-8`, `1,3,5-7`, etc. Only the keys whose state differs are actuated. This is the clean way to build a "focus mute" shortcut: firing it twice still leaves everything muted, and the Unmuted variant restores exactly. Requires _Monitor mute state_.

> **Why state-aware matters:** _Toggle Mute on Key_ fires blind — if a key is already muted, a toggle **unmutes** it. The state-aware actions read the panel first, so "mute these 8" always ends with those 8 muted regardless of where they started.

### Key-Press Monitoring

Enable **Monitor key presses** in the connection config to have the module open a second, read-only connection to the panel's `/live-view` WebSocket. It surfaces every physical key actuation as variables and feedbacks, so a real panel key press (not a Companion/Stream Deck button) can drive Companion logic — flashes, triggers, batch mutes, etc.

- Two controls per key are reported independently:
  - **Lever** (the talk/listen paddle): state is `Up`, `Down`, or `Released` (centre rest). A physical flick emits `Up` (or `Down`) then `Released` on return.
  - **Button** (the rotary-encoder push): state is `Pressed` or `Released`.
- Key numbers are **1-based (1–32)**, matching the mute actions. Panel `0` is the master; `1`–`4` are expansion panels.
- Use the **Key Lever State** / **Key Button State** feedbacks — or the `last_lever_*` / `last_button_*` variables in a trigger's condition — to react to a press.

> **Muting note:** _Toggle Mute on Key_ uses the rotary-encoder push (`SimulateButton`). Flicking a key's lever up is a **separate** control that can also toggle mute depending on panel configuration; the monitoring feedbacks let you build logic around either. See _LiveView protocol_ below.

### Mute-State Monitoring

The panel exposes **no mute field** anywhere in its API — but it _renders_ a red crossed-speaker glyph on every muted key. With **Monitor mute state** enabled, the module reads the panel's key displays and decodes that glyph, giving true per-key mute state.

- Populates `key_1_muted` … `key_32_muted`, plus `muted_keys` and `muted_count`.
- Drives the **Key Muted** feedback, so a button can show a key's real mute state.
- Powers the **state-aware** mute actions above.
- It's **event-driven**: the panel pushes an updated display automatically whenever a key's rendering changes, so there's no polling and no traffic while idle.

**Limitations** — worth knowing before you rely on it:

1. It reads what is **currently rendered**, so it covers the **displayed shift page** only. Keys on another shift page report unknown (empty variable; state-aware actions skip them and log a warning).
2. **Master panel only.** The display frames carry a display index but no panel id, so pushed frames can't be attributed to expansion panels.
3. It's a visual heuristic — a firmware or theme change could restyle/move the glyph, which would need the detection region or threshold retuned.

## Feedbacks

- **Connection Status**: Visual indicator for WebSocket connection state (to Companion)
- **Link Status**: Shows if a particular network link is up
- **Artist Connection Status**: Shows if the panel is connected to an Artist system
- **Health Status**: Color-coded health indicator (OK/Warnings/Errors)
- **Alarm Count**: Threshold-based alarm monitoring with customizable colors
- **PTP Status**: PTP synchronization status (Locked/Unlocked)
- **Control Panel Enabled**: Shows if Control Panel app is active
- **NMOS Enabled**: Shows if NMOS is active
- **Key Lever State**: True while a monitored key's lever is in the selected position (Up/Down/Released) — requires _Monitor key presses_
- **Key Button State**: True while a monitored key's encoder button is Pressed/Released — requires _Monitor key presses_
- **Key Muted**: True when a key is actually muted (decoded from the key display) — requires _Monitor mute state_

## Presets

38+ pre-configured button presets across 9+ categories:

- **Status Display**: Connection, health, alarms, PTP status
- **Network Status**: Interface IP addresses
- **Device Info**: Name, firmware, MAC address
- **Actions**: Refresh buttons for all status types
- **Control Panel**: Enable/disable/toggle buttons
- **NMOS**: Enable/disable/toggle buttons
- **PTP**: Refresh and domain selection (0-7)
- **Device Control**: Reboot button
- **Alert Indicators**: Health errors, active alarms, PTP unlocked, disconnected alerts

## Variables

| Variable                       | Description                                                         |
| ------------------------------ | ------------------------------------------------------------------- |
| `connection_status`            | Current connection state (to Companion)                             |
| `media1_ip`                    | Media1 interface IP address                                         |
| `config1_ip`                   | Config1 interface IP address                                        |
| `media2_ip`                    | Media2 interface IP address                                         |
| `media1_mac_address`           | Media1 interface MAC address                                        |
| `config1_mac_address`          | Config1 interface MAC address                                       |
| `media2_mac_address`           | Media2 interface MAC address                                        |
| `expansion1_mac_address`       | expansion1 interface MAC address                                    |
| `media1_link_status`           | Media1 interface link status                                        |
| `config1_link_status`          | Config1 interface link status                                       |
| `media2_link_status`           | Media2 interface link status                                        |
| `expansion1_link_status`       | expansion1 interface link status                                    |
| `device_name`                  | Device name                                                         |
| `firmware_version`             | Firmware version                                                    |
| `headset_a_connector_type`     | Headset A connector type                                            |
| `headset_b_connector_type`     | Headset B connector type                                            |
| `panel_type`                   | Panel type                                                          |
| `serial_number`                | Serial number                                                       |
| `mac_address`                  | MAC address                                                         |
| `health_status`                | Current health status                                               |
| `alarm_count`                  | Number of active alarms                                             |
| `ptp_status`                   | PTP synchronization status                                          |
| `ptp_master`                   | PTP time transmitter (master clock)                                 |
| `ptp_domain`                   | PTP domain                                                          |
| `ptp_hybrid_mode`              | PTP hybrid mode state                                               |
| `ptp_receiver_only`            | PTP receiver-only mode state                                        |
| `control_panel_enabled`        | Control Panel app state                                             |
| `nmos_enabled`                 | NMOS state                                                          |
| `nmos_status`                  | NMOS status                                                         |
| `last_lever_key`               | Most recent lever event: key number (1-based)                       |
| `last_lever_state`             | Most recent lever event: `Up`/`Down`/`Released`                     |
| `last_lever_panel`             | Most recent lever event: panel (0 = master, 1-4 = expansion)        |
| `last_button_key`              | Most recent encoder-push event: key number (1-based)                |
| `last_button_state`            | Most recent encoder-push event: `Pressed`/`Released`                |
| `last_button_panel`            | Most recent encoder-push event: panel (0 = master, 1-4 = expansion) |
| `key_1_muted` … `key_32_muted` | Per-key mute state: `true` / `false` (empty if not known)           |
| `muted_keys`                   | Comma-separated list of currently muted key numbers                 |
| `muted_count`                  | How many keys are currently muted                                   |

## Network Interfaces

The Smart Panel has three network interfaces:

- **Media1**: Main network interface (typically for control/media)
- **Config1**: Configuration network interface
- **Media2**: Secondary media network interface

## Troubleshooting

### Cannot Connect

1. Verify the IP address is correct
2. Ensure the panel is powered on and accessible on the network
3. Check that no firewall is blocking WebSocket connections
4. Try pinging the device first

### Changes Don't Take Effect

- Some settings may require a device reboot
- Wait a few seconds after sending commands
- Check the connection status in Companion

## LiveView protocol (reference)

The panel's `/live-view` WebSocket (same host/port as the main `/websocket`) is **bidirectional** and is used by this module for both key monitoring and muting. Messages are JSON `{ "topic": string, "body": object }`, one message per frame. `keyId` on the wire is **0-based** (`keyId = keyNumber − 1`); `panelId` is `0` for the master and `1`–`4` for expansions.

**Notifications the panel emits** (consumed by _Monitor key presses_):

- `/LiveView/LeverStateChanged` — `{ panelId, keyId, leverState }`, `leverState` ∈ `Up` | `Down` | `Released`.
- `/LiveView/ButtonStateChanged` — `{ panelId, keyId, buttonState }`, `buttonState` ∈ `Pressed` | `Released`.
- `/LiveView/LeverKeyLedRingStateChanged` — high-frequency ring-colour updates (ignored by this module).

The panel only emits a notification on an **actual state change**, and it broadcasts to _all_ connected live-view clients (including the ones this module opens).

**Commands the panel accepts** (used by the mute actions):

- `/LiveView/SimulateButton` — `{ panelId, keyId, buttonState: "Pressed" | "Released" }`. _Toggle Mute on Key_ sends `Pressed`, holds ≥200ms (firmware minimum), then `Released` — a momentary rotary-encoder push.
- `/LiveView/SimulateLever` — `{ panelId, keyId, leverState: "Up" | "Down" | "Released" }`. A momentary lever flick (`Up`/`Down` then `Released`) is a separate way to toggle a key's mute latch on some configurations. Send the target keys one gesture each — a sustained state without the return-to-`Released` will not re-toggle on the next flick.

### Display content (how mute state is recovered)

`/LiveView/RequestDisplayContent` `{ panelId }` replies with **binary** frames (not JSON), and after `SubscribePanelEvents` the panel pushes an updated frame automatically whenever a display changes. Frame layout:

```
uint16 displayIndex | uint16 mimeLength | <mime, e.g. "image/jpg"> | <image bytes>
```

On an RSP-1232HL there are three displays:

| Index | Size     | Contents                           |
| ----- | -------- | ---------------------------------- |
| `0`   | 1284×248 | Left keybank — **keys 1–16**       |
| `1`   | 1284×248 | Right keybank — **keys 17–32**     |
| `2`   | 240×400  | Centre info display (no key cells) |

Each keybank image is an **8 × 2 grid** of key cells (top row first). A muted key draws a red crossed-speaker glyph in the **top-right** of its cell, so the module crops roughly `x: 72–99%`, `y: 2–30%` of each cell and measures the fraction of strongly-red pixels (`r>140`, `r−g>60`, `r−b>40`). The result is sharply bimodal — ~0.00 unmuted vs ~0.12–0.21 muted — so a 0.02 threshold separates them reliably on both dark and light (active) key backgrounds.

## Support

For issues or feature requests, please visit:
https://github.com/bitfocus/companion-module-riedel-smartpanel/issues
