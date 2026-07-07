import { Link, usePage, type InertiaLinkProps } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import {
    dashboard,
    home,
    logout,
} from '@/routes';
import { index as opportunities } from '@/routes/opportunities';
import { edit as profile } from '@/routes/profile';
import { index as projects } from '@/routes/projects';
import { index as proposals } from '@/routes/proposals';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { BreadcrumbItem } from '@/types';

type Props = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

type NavItem = {
    title: string;
    icon: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    badge?: string;
};

type NavSection = {
    label?: string;
    items: NavItem[];
};

const shellStyles = `
  .bd-app-shell {
    --bg: #F6F7F9;
    --surface: #FFFFFF;
    --surface-raised: #FFFFFF;
    --border: #E4E6EB;
    --text: #12161F;
    --text-muted: #6B7280;
    --accent: #C77F1F;
    --accent-text: #FFFFFF;
    --success: #1F8A5F;
    --danger: #D6383D;
    --accent-soft: rgba(199,127,31,0.1);
    --success-soft: rgba(31,138,95,0.1);
    --danger-soft: rgba(214,56,61,0.1);
    --shadow-raised: 0 4px 16px rgba(0,0,0,0.08);
    --font-display: "Instrument Sans", sans-serif;
    --font-mono: "JetBrains Mono", monospace;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-display);
    font-size: 14px;
    height: 100vh;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .bd-app-shell[data-theme="dark"] {
    --bg: #0B0E14;
    --surface: #12161F;
    --surface-raised: #1A1F2B;
    --border: #232838;
    --text: #EDEFF3;
    --text-muted: #8B93A6;
    --accent: #E8A33D;
    --accent-text: #12161F;
    --success: #34A87C;
    --danger: #E5484D;
    --accent-soft: rgba(232,163,61,0.12);
    --success-soft: rgba(52,168,124,0.12);
    --danger-soft: rgba(229,72,77,0.12);
    --shadow-raised: 0 4px 16px rgba(0,0,0,0.24);
  }

  .bd-app-shell * { margin: 0; padding: 0; box-sizing: border-box; }
  .bd-app-shell * {
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .bd-app-shell *::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }
  .bd-app-shell *::-webkit-scrollbar-track { background: transparent; }
  .bd-app-shell *::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 999px;
  }
  .bd-app-shell *::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
  .bd-app-shell button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
  .bd-app-shell a { color: inherit; text-decoration: none; }
  .bd-app-shell input { font: inherit; color: inherit; }
  .bd-app-shell input::placeholder { color: inherit; opacity: 1; }
  .bd-app-shell a:focus-visible,
  .bd-app-shell button:focus-visible,
  .bd-app-shell input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .bd-app-shell .icon {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }
  .bd-app-shell .icon-sm { width: 15px; height: 15px; }

  .bd-app-shell .app-shell { display: flex; height: 100vh; overflow: hidden; }
  .bd-app-shell .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: width 0.2s ease;
  }
  .bd-app-shell .sidebar.collapsed { width: 68px; }
  .bd-app-shell .sidebar-toggle {
    position: absolute;
    top: 16px;
    right: -14px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    box-shadow: var(--shadow-raised);
    z-index: 35;
    transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  }
  .bd-app-shell .sidebar-toggle:hover { color: var(--text); border-color: var(--accent); }
  .bd-app-shell .sidebar-toggle .icon { transition: transform 0.2s ease; }
  .bd-app-shell .sidebar.collapsed .sidebar-toggle .icon { transform: rotate(180deg); }
  .bd-app-shell .sidebar-brand {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .bd-app-shell .brand-mark {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bd-app-shell .brand-mark span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }
  .bd-app-shell .brand-name {
    font-weight: 600;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
  }
  .bd-app-shell .sidebar.collapsed .brand-name,
  .bd-app-shell .sidebar.collapsed .nav-label,
  .bd-app-shell .sidebar.collapsed .sidebar-section-label {
    display: none;
  }
  .bd-app-shell .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .bd-app-shell .sidebar.collapsed .sidebar-nav { overflow: visible; }
  .bd-app-shell .sidebar-section-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    padding: 14px 10px 6px;
  }
  .bd-app-shell .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 10px;
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 13.5px;
    font-weight: 500;
    white-space: nowrap;
    position: relative;
    transition: background 0.12s ease, color 0.12s ease;
  }
  .bd-app-shell .nav-item:hover { background: var(--surface-raised); color: var(--text); }
  .bd-app-shell .nav-item.active { background: var(--accent-soft); color: var(--accent); }
  .bd-app-shell .sidebar.collapsed .nav-item { justify-content: center; }
  .bd-app-shell .nav-item .badge {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }
  .bd-app-shell .sidebar.collapsed .nav-item .badge { display: none; }
  .bd-app-shell .tooltip { display: none; }
  .bd-app-shell .sidebar.collapsed .tooltip {
    display: block;
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 10px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 40;
    box-shadow: var(--shadow-raised);
  }
  .bd-app-shell .sidebar.collapsed .nav-item:hover .tooltip { opacity: 1; }
  .bd-app-shell .sidebar-footer {
    border-top: 1px solid var(--border);
    padding: 10px 12px;
    flex-shrink: 0;
  }

  .bd-app-shell .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .bd-app-shell .topbar {
    height: 60px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: var(--bg);
  }
  .bd-app-shell .topbar-left { display: flex; align-items: center; gap: 14px; }
  .bd-app-shell .breadcrumb { font-size: 13.5px; font-weight: 600; color: var(--text); }
  .bd-app-shell .search-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 280px;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 13px;
  }
  .bd-app-shell .search-trigger:hover { border-color: var(--accent); }
  .bd-app-shell .search-trigger .kbd {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 6px;
  }
  .bd-app-shell .topbar-right { display: flex; align-items: center; gap: 8px; }
  .bd-app-shell .icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    position: relative;
  }
  .bd-app-shell .icon-btn:hover { background: var(--surface-raised); color: var(--text); }
  .bd-app-shell .icon-btn .dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--danger);
    border: 1.5px solid var(--bg);
  }
  .bd-app-shell .avatar-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 4px;
    border-radius: 8px;
  }
  .bd-app-shell .avatar-btn:hover { background: var(--surface-raised); }
  .bd-app-shell .avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .bd-app-shell .dropdown-wrap { position: relative; }
  .bd-app-shell .dropdown-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 260px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-raised);
    padding: 6px;
    z-index: 50;
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
    pointer-events: none;
    transition: opacity 0.14s ease, transform 0.14s ease;
  }
  .bd-app-shell .dropdown-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .bd-app-shell .dropdown-header {
    padding: 8px 10px;
    font-size: 12.5px;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
    margin-bottom: 4px;
  }
  .bd-app-shell .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 7px;
    font-size: 13px;
    color: var(--text);
    width: 100%;
    text-align: left;
  }
  .bd-app-shell .dropdown-item:hover { background: var(--bg); }
  .bd-app-shell .dropdown-item.danger { color: var(--danger); }
  .bd-app-shell .notif-item { padding: 10px; border-radius: 7px; }
  .bd-app-shell .notif-item:hover { background: var(--bg); }
  .bd-app-shell .notif-title { font-size: 12.5px; font-weight: 500; margin-bottom: 2px; }
  .bd-app-shell .notif-time { font-size: 11.5px; color: var(--text-muted); }
  .bd-app-shell .theme-switch {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
  }
  .bd-app-shell .theme-switch button {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
  .bd-app-shell .theme-switch button.active { background: var(--accent-soft); color: var(--accent); }
  .bd-app-shell .content { flex: 1; overflow-y: auto; padding: 28px 32px 48px; }
  .bd-app-shell .mobile-menu-btn { display: none; }

  .bd-app-shell .cmdk-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 12vh;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .bd-app-shell .cmdk-backdrop.open { opacity: 1; pointer-events: auto; }
  .bd-app-shell .cmdk-modal {
    width: 100%;
    max-width: 560px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    transform: translateY(-12px) scale(0.98);
    transition: transform 0.15s ease;
  }
  .bd-app-shell .cmdk-backdrop.open .cmdk-modal { transform: translateY(0) scale(1); }
  .bd-app-shell .cmdk-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text-muted);
  }
  .bd-app-shell .cmdk-input-row input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 14.5px;
  }
  .bd-app-shell .cmdk-input-row .kbd {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
  }
  .bd-app-shell .cmdk-list { padding: 8px; max-height: 320px; overflow-y: auto; }
  .bd-app-shell .cmdk-section-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    padding: 10px 10px 6px;
  }
  .bd-app-shell .cmdk-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
    text-align: left;
    color: var(--text);
    font-size: 13.5px;
  }
  .bd-app-shell .cmdk-item:hover,
  .bd-app-shell .cmdk-item.hi { background: var(--accent-soft); color: var(--accent); }

  @media (max-width: 1024px) {
    .bd-app-shell .search-trigger { display: none; }
  }

  @media (max-width: 760px) {
    .bd-app-shell .sidebar {
      position: fixed;
      z-index: 60;
      height: 100vh;
      left: -240px;
      transition: left 0.2s ease;
    }
    .bd-app-shell .sidebar.mobile-open { left: 0; }
    .bd-app-shell .sidebar.collapsed { width: 240px; }
    .bd-app-shell .mobile-menu-btn { display: flex; }
    .bd-app-shell .content { padding: 20px 16px 40px; }
    .bd-app-shell .topbar { padding: 0 16px; }
    .bd-app-shell .sidebar-toggle { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bd-app-shell * { transition: none !important; }
  }
`;

const dashboardStyles = `
  .bd-app-shell .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .bd-app-shell .page-header h1 {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .bd-app-shell .page-header p { font-size: 13.5px; color: var(--text-muted); }
  .bd-app-shell .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    transition: opacity 0.12s ease, transform 0.1s ease;
  }
  .bd-app-shell .btn:active { transform: scale(0.97); }
  .bd-app-shell .btn-primary { background: var(--accent); color: var(--accent-text); }
  .bd-app-shell .btn-primary:hover { opacity: 0.88; }
  .bd-app-shell .btn-action {
    padding: 6px 13px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    color: var(--text);
    flex-shrink: 0;
    transition: background 0.12s ease;
  }
  .bd-app-shell .btn-action:hover {
    background: var(--accent);
    color: var(--accent-text);
    border-color: var(--accent);
  }
  .bd-app-shell .btn-action.done {
    background: var(--success-soft);
    color: var(--success);
    border-color: transparent;
    pointer-events: none;
  }
  .bd-app-shell .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  .bd-app-shell .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }
  .bd-app-shell .stat-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .bd-app-shell .stat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .bd-app-shell .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .bd-app-shell .stat-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
  }
  .bd-app-shell .stat-value {
    font-family: var(--font-mono);
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .bd-app-shell .stat-meta { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
  .bd-app-shell .stat-meta.positive { color: var(--success); }
  .bd-app-shell .stat-meta.warn { color: var(--danger); }
  .bd-app-shell .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .bd-app-shell .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
  }
  .bd-app-shell .panel-head h2 { font-size: 14.5px; font-weight: 600; }
  .bd-app-shell .panel-link { font-size: 12.5px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
  .bd-app-shell .panel-link:hover { color: var(--accent); }
  .bd-app-shell .panel-body { padding: 6px; }
  .bd-app-shell .action-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border-radius: 9px;
  }
  .bd-app-shell .action-row:hover { background: var(--bg); }
  .bd-app-shell .action-row + .action-row { margin-top: 2px; }
  .bd-app-shell .action-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bd-app-shell .action-icon.warn { background: var(--danger-soft); color: var(--danger); }
  .bd-app-shell .action-icon.wait { background: var(--accent-soft); color: var(--accent); }
  .bd-app-shell .action-text { flex: 1; min-width: 0; }
  .bd-app-shell .action-title { font-size: 13.5px; font-weight: 500; margin-bottom: 2px; }
  .bd-app-shell .action-sub { font-size: 12px; color: var(--text-muted); }
  .bd-app-shell .action-sub .amount { font-family: var(--font-mono); color: var(--text); font-weight: 500; }
  .bd-app-shell .split-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; }
  .bd-app-shell .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    white-space: nowrap;
  }
  .bd-app-shell .pill .dot { width: 6px; height: 6px; border-radius: 50%; }
  .bd-app-shell .pill-accent { background: var(--accent-soft); color: var(--accent); }
  .bd-app-shell .pill-accent .dot { background: var(--accent); }
  .bd-app-shell .pill-success { background: var(--success-soft); color: var(--success); }
  .bd-app-shell .pill-success .dot { background: var(--success); }
  .bd-app-shell .pill-danger { background: var(--danger-soft); color: var(--danger); }
  .bd-app-shell .pill-danger .dot { background: var(--danger); }
  .bd-app-shell .pill-muted { background: var(--surface-raised); color: var(--text-muted); border: 1px solid var(--border); }
  .bd-app-shell .pill-muted .dot { background: var(--text-muted); }
  .bd-app-shell .opp-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 9px;
  }
  .bd-app-shell .opp-row:hover { background: var(--bg); }
  .bd-app-shell .opp-info { flex: 1; min-width: 0; }
  .bd-app-shell .opp-title { font-size: 13.5px; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bd-app-shell .opp-client { font-size: 12px; color: var(--text-muted); }
  .bd-app-shell .opp-value { font-family: var(--font-mono); font-size: 13px; font-weight: 500; }
  .bd-app-shell .feed-item { display: flex; gap: 12px; padding: 11px 12px; }
  .bd-app-shell .feed-dot-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; padding-top: 3px; }
  .bd-app-shell .feed-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border); }
  .bd-app-shell .feed-dot.accent { background: var(--accent); }
  .bd-app-shell .feed-dot.success { background: var(--success); }
  .bd-app-shell .feed-line { width: 1px; flex: 1; background: var(--border); margin-top: 4px; }
  .bd-app-shell .feed-text { font-size: 13px; margin-bottom: 2px; }
  .bd-app-shell .feed-time { font-size: 11.5px; color: var(--text-muted); }

  @media (max-width: 1024px) {
    .bd-app-shell .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .bd-app-shell .split-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 760px) {
    .bd-app-shell .page-header { flex-direction: column; align-items: flex-start; }
    .bd-app-shell .stats-grid { grid-template-columns: 1fr; }
  }
`;

const iconSprite = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></symbol>
      <symbol id="i-kanban" viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></symbol>
      <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 12h18"/></symbol>
      <symbol id="i-file" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M14 2v5h5"/><path d="M8 13h8M8 17h8M8 9h3"/></symbol>
      <symbol id="i-trend" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 12h3"/></symbol>
      <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></symbol>
      <symbol id="i-quote" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3V2a1 1 0 011-1h4a1 1 0 011 1v1"/><path d="M9 10l1.5 1.5L14 8"/><path d="M8 15h8"/></symbol>
      <symbol id="i-receipt" viewBox="0 0 24 24"><path d="M6 2h12v19l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.8 12.3c2.6.4 4.7 2.4 4.7 5.4"/></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z"/><path d="M10 19a2 2 0 004 0"/></symbol>
      <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></symbol>
      <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-1.7-1L14.8 3h-3.6l-.5 2.6a7.4 7.4 0 00-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.5 2.6h3.6l.5-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6z"/></symbol>
      <symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
      <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.3-4.3"/></symbol>
      <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></symbol>
      <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/></symbol>
      <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
      <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
      <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></symbol>
      <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></symbol>
      <symbol id="i-check-square" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
      <symbol id="i-message-circle" viewBox="0 0 24 24"><path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1 4.5A7.9 7.9 0 0121 12z"/></symbol>
      <symbol id="i-send" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><path d="M4 4h4l2 6-3 2a13 13 0 006 6l2-3 6 2v4a2 2 0 01-2 2C10 23 1 14 1 4a2 2 0 012-2z"/></symbol>
      <symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></symbol>
      <symbol id="i-paperclip" viewBox="0 0 24 24"><path d="M21 12.5l-8.5 8.5a4 4 0 01-5.7-5.7l9-9a2.7 2.7 0 013.8 3.8l-8.5 8.5a1.3 1.3 0 01-1.9-1.9l7.9-7.9"/></symbol>
      <symbol id="i-tag" viewBox="0 0 24 24"><path d="M12 2H4a1 1 0 00-1 1v8l10 10 9-9L12 2z"/><circle cx="7" cy="7" r="1.3"/></symbol>
      <symbol id="i-align-left" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13"/></symbol>
    </defs>
  </svg>
`;

const commandItems: Array<{
    section: string;
    label: string;
    icon: string;
    highlighted?: boolean;
}> = [
    { section: 'Quick actions', label: 'New Opportunity', icon: 'i-plus', highlighted: true },
    { section: 'Quick actions', label: 'New Invoice', icon: 'i-file' },
    { section: 'Jump to', label: 'Opportunities', icon: 'i-kanban' },
    { section: 'Jump to', label: 'Projects', icon: 'i-briefcase' },
    { section: 'Jump to', label: 'Contacts', icon: 'i-users' },
];

const notificationItems = [
    { title: 'Invoice INV-0043 is now overdue', time: '2 hours ago' },
    { title: 'New lead via public form: Retail Co', time: 'Yesterday' },
    { title: 'Payment received for INV-0041', time: '2 days ago' },
] as const;

export default function BiondeskAppShell({
    children,
    breadcrumbs = [],
}: Props) {
    const page = usePage();
    const { auth, currentTeam, sidebarOpen } = page.props;
    const { appearance, updateAppearance } = useAppearance();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const initials = useInitials();
    const [desktopCollapsed, setDesktopCollapsed] = useState(!(sidebarOpen ?? true));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [systemDark, setSystemDark] = useState(false);
    const notificationsRef = useRef<HTMLDivElement | null>(null);
    const userRef = useRef<HTMLDivElement | null>(null);

    const currentPageTitle =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Workspace';

    const propsBag = page.props as Record<string, unknown>;
    const opportunityCount = Array.isArray(propsBag.opportunities)
        ? String(propsBag.opportunities.length)
        : '6';
    const projectCount = Array.isArray(propsBag.projects)
        ? String(propsBag.projects.length)
        : '4';
    const proposalCount = Array.isArray(propsBag.documents)
        ? String(propsBag.documents.length)
        : '2';

    const navSections = useMemo<NavSection[]>(() => {
        if (!currentTeam) {
            return [];
        }

        return [
            {
                items: [
                    { title: 'Dashboard', icon: 'i-grid', href: dashboard(currentTeam.slug) },
                    { title: 'Opportunities', icon: 'i-kanban', href: opportunities(currentTeam.slug), badge: opportunityCount },
                    { title: 'Projects', icon: 'i-briefcase', href: projects(currentTeam.slug), badge: projectCount },
                ],
            },
            {
                label: 'Documents',
                items: [
                    { title: 'Proposals', icon: 'i-file', href: proposals(currentTeam.slug), badge: proposalCount },
                    { title: 'Quotations', icon: 'i-quote', badge: '1' },
                    { title: 'Invoices', icon: 'i-receipt', badge: '3' },
                    { title: 'Contacts', icon: 'i-users' },
                ],
            },
            {
                label: 'Workspace',
                items: [
                    { title: 'Reminders', icon: 'i-bell' },
                    { title: 'Profile Library', icon: 'i-layers' },
                ],
            },
        ];
    }, [currentTeam, opportunityCount, projectCount, proposalCount]);

    useEffect(() => {
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = (): void => setSystemDark(mediaQuery.matches);

        apply();
        mediaQuery.addEventListener('change', apply);

        return () => {
            mediaQuery.removeEventListener('change', apply);
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent): void => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setCommandOpen((current) => !current);
            }

            if (event.key === 'Escape') {
                setCommandOpen(false);
                setNotificationsOpen(false);
                setUserOpen(false);
                setMobileOpen(false);
            }
        };

        const onDocumentClick = (event: MouseEvent): void => {
            const target = event.target as Node;

            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(target)
            ) {
                setNotificationsOpen(false);
            }

            if (userRef.current && !userRef.current.contains(target)) {
                setUserOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', onDocumentClick);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('click', onDocumentClick);
        };
    }, []);

    const resolvedTheme =
        appearance === 'system' ? (systemDark ? 'dark' : 'light') : appearance;

    const toggleCollapsed = (): void => {
        const next = !desktopCollapsed;
        setDesktopCollapsed(next);
        document.cookie = `sidebar_state=${!next}; path=/; max-age=604800; SameSite=Lax`;
    };

    return (
        <div className="bd-app-shell" data-theme={resolvedTheme}>
            <style>{shellStyles}</style>
            <style>{dashboardStyles}</style>
            <div dangerouslySetInnerHTML={{ __html: iconSprite }} />

            <div className="app-shell">
                <aside
                    className={cn(
                        'sidebar',
                        desktopCollapsed && 'collapsed',
                        mobileOpen && 'mobile-open',
                    )}
                >
                    <div className="sidebar-brand">
                        <Link
                            href={currentTeam ? dashboard(currentTeam.slug) : home()}
                            className="flex items-center gap-[10px]"
                        >
                            <div className="brand-mark">
                                <span />
                            </div>
                            <span className="brand-name">Biondesk</span>
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="sidebar-toggle"
                        title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        onClick={toggleCollapsed}
                    >
                        <IconUse icon="i-chevron-left" small={true} />
                    </button>

                    <nav className="sidebar-nav">
                        {navSections.map((section, index) => (
                            <div key={section.label ?? `section-${index}`}>
                                {section.label ? (
                                    <div className="sidebar-section-label">{section.label}</div>
                                ) : null}

                                {section.items.map((item) => (
                                    <SidebarNavLink
                                        key={item.title}
                                        item={item}
                                        active={item.href ? isCurrentOrParentUrl(item.href) : false}
                                        collapsed={desktopCollapsed}
                                    />
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <Link
                            href={profile()}
                            prefetch
                            className="nav-item"
                        >
                            <IconUse icon="i-settings" />
                            <span className="nav-label">Settings</span>
                            <span className="tooltip">Settings</span>
                        </Link>
                    </div>
                </aside>

                <div className="main-area">
                    <header className="topbar">
                        <div className="topbar-left">
                            <button
                                type="button"
                                className="mobile-menu-btn icon-btn"
                                onClick={() => setMobileOpen((current) => !current)}
                            >
                                <IconUse icon="i-menu" />
                            </button>
                            <span className="breadcrumb">{currentPageTitle}</span>
                        </div>

                        <button
                            type="button"
                            className="search-trigger"
                            onClick={() => setCommandOpen(true)}
                        >
                            <IconUse icon="i-search" small={true} />
                            <span>Search or jump to...</span>
                            <span className="kbd">⌘K</span>
                        </button>

                        <div className="topbar-right">
                            <div className="theme-switch">
                                <button
                                    type="button"
                                    className={appearance === 'light' ? 'active' : undefined}
                                    title="Light"
                                    onClick={() => updateAppearance('light')}
                                >
                                    <IconUse icon="i-sun" small={true} />
                                </button>
                                <button
                                    type="button"
                                    className={appearance === 'dark' ? 'active' : undefined}
                                    title="Dark"
                                    onClick={() => updateAppearance('dark')}
                                >
                                    <IconUse icon="i-moon" small={true} />
                                </button>
                                <button
                                    type="button"
                                    className={appearance === 'system' ? 'active' : undefined}
                                    title="System"
                                    onClick={() => updateAppearance('system')}
                                >
                                    <IconUse icon="i-monitor" small={true} />
                                </button>
                            </div>

                            <div className="dropdown-wrap" ref={notificationsRef}>
                                <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setNotificationsOpen((current) => !current);
                                        setUserOpen(false);
                                    }}
                                >
                                    <IconUse icon="i-bell" />
                                    <span className="dot" />
                                </button>
                                <div
                                    className={cn(
                                        'dropdown-panel',
                                        notificationsOpen && 'open',
                                    )}
                                >
                                    <div className="dropdown-header">Notifications</div>
                                    {notificationItems.map((item) => (
                                        <div key={item.title} className="notif-item">
                                            <div className="notif-title">{item.title}</div>
                                            <div className="notif-time">{item.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="dropdown-wrap" ref={userRef}>
                                <button
                                    type="button"
                                    className="avatar-btn"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setUserOpen((current) => !current);
                                        setNotificationsOpen(false);
                                    }}
                                >
                                    <div className="avatar">{initials(auth.user.name)}</div>
                                    <IconUse
                                        icon="i-chevron-down"
                                        small={true}
                                        className="text-[var(--text-muted)]"
                                    />
                                </button>
                                <div
                                    className={cn(
                                        'dropdown-panel',
                                        userOpen && 'open',
                                    )}
                                >
                                    <Link href={profile()} prefetch className="dropdown-item">
                                        <IconUse icon="i-user" small={true} />
                                        Profile
                                    </Link>
                                    <Link href={profile()} prefetch className="dropdown-item">
                                        <IconUse icon="i-settings" small={true} />
                                        Settings
                                    </Link>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        className="dropdown-item danger"
                                    >
                                        <IconUse icon="i-logout" small={true} />
                                        Log out
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="content">{children}</main>
                </div>
            </div>

            <div
                className={cn('cmdk-backdrop', commandOpen && 'open')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setCommandOpen(false);
                    }
                }}
            >
                <div className="cmdk-modal">
                    <div className="cmdk-input-row">
                        <IconUse icon="i-search" />
                        <input
                            autoFocus={commandOpen}
                            type="text"
                            placeholder="Search opportunities, projects, invoices..."
                        />
                        <span className="kbd">Esc</span>
                    </div>
                    <div className="cmdk-list">
                        {Array.from(new Set(commandItems.map((item) => item.section))).map(
                            (section) => (
                                <div key={section}>
                                    <div className="cmdk-section-label">{section}</div>
                                    {commandItems
                                        .filter((item) => item.section === section)
                                        .map((item) => (
                                            <button
                                                key={item.label}
                                                type="button"
                                                className={cn('cmdk-item', item.highlighted && 'hi')}
                                                onClick={() => setCommandOpen(false)}
                                            >
                                                <IconUse icon={item.icon} />
                                                {item.label}
                                            </button>
                                        ))}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNavLink({
    item,
    active,
    collapsed,
}: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
}) {
    const content = (
        <>
            <IconUse icon={item.icon} />
            <span className="nav-label">{item.title}</span>
            {item.badge ? <span className="badge">{item.badge}</span> : null}
            <span className="tooltip">{item.title}</span>
        </>
    );

    if (item.href) {
        return (
            <Link
                href={item.href}
                prefetch
                className={cn('nav-item', active && 'active')}
                onClick={() => {
                    if (collapsed) {
                        return;
                    }
                }}
            >
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className="nav-item w-full text-left">
            {content}
        </button>
    );
}

function IconUse({
    icon,
    small = false,
    className,
}: {
    icon: string;
    small?: boolean;
    className?: string;
}) {
    return (
        <svg className={cn('icon', small && 'icon-sm', className)}>
            <use href={`#${icon}`} />
        </svg>
    );
}
