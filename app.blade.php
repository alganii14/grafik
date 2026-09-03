<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') - Aktivitas </title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #eef3f9;
            color: #33415c;
            overflow-x: hidden;
        }

        html {
            overflow-x: hidden;
        }

        .main-container {
            display: flex;
            min-height: 100vh;
        }

        /* Hamburger Menu Button */
        .hamburger-menu {
            display: flex;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            padding: 8px;
            background: none;
            border: none;
            z-index: 1001;
        }

        .hamburger-menu span {
            width: 25px;
            height: 3px;
            background-color: #14294b;
            transition: all 0.3s;
            border-radius: 2px;
        }

        .hamburger-menu:hover {
            background-color: rgba(13, 60, 120, 0.07);
            border-radius: 8px;
        }

        .hamburger-menu:active {
            background-color: rgba(13, 60, 120, 0.12);
        }

        .hamburger-menu.active span:nth-child(1) {
            transform: rotate(45deg) translate(7px, 7px);
        }

        .hamburger-menu.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger-menu.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -7px);
        }

        /* Sidebar Overlay for Mobile */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        .sidebar-overlay.active {
            display: block;
        }

        /* Sidebar */
        .sidebar {
            width: 260px;
            background: linear-gradient(180deg, #0066CC 0%, #004E9E 45%, #003D82 100%);
            color: white;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            box-shadow: 2px 0 18px rgba(3, 32, 71, 0.18);
            z-index: 1000;
            transition: transform 0.3s ease;
            -webkit-overflow-scrolling: touch;
        }

        .sidebar.hidden {
            transform: translateX(-100%);
        }

        /* Show sidebar toggle button */
        .sidebar-toggle-hint {
            position: fixed;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #0066CC 0%, #003D82 100%);
            color: white;
            padding: 10px 6px;
            border-radius: 0 6px 6px 0;
            cursor: pointer;
            z-index: 999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s, left 0.3s;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
        }

        .sidebar.hidden ~ .main-content .sidebar-toggle-hint {
            opacity: 0.7;
            pointer-events: auto;
        }

        .sidebar-toggle-hint:hover {
            opacity: 1 !important;
            left: 0;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 260px;
            min-height: 100vh;
            transition: margin-left 0.3s ease;
            width: calc(100vw - 260px);
            overflow-x: auto;
        }

        .main-content.expanded {
            margin-left: 0;
            width: 100vw;
        }

        /* Scrollbar for main-content (tipis) */
        .main-content::-webkit-scrollbar {
            height: 8px;
            width: 8px;
        }

        .main-content::-webkit-scrollbar-track {
            background: #e8eef7;
            border-radius: 8px;
        }

        .main-content::-webkit-scrollbar-thumb {
            background: #c3d3e8;
            border-radius: 8px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
            background: #a9bfdd;
        }

        /* Scrollbar styling for sidebar (tipis) */
        .sidebar::-webkit-scrollbar {
            width: 5px;
        }

        .sidebar::-webkit-scrollbar-track {
            background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.28);
            border-radius: 8px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.45);
        }

        .sidebar-header {
            padding: 22px 20px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
        }

        .sidebar-header h2 {
            font-size: 19px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        .sidebar-header h2::after {
            content: '';
            display: block;
            width: 34px;
            height: 3px;
            margin-top: 8px;
            border-radius: 2px;
            background: #72d0ff;
        }

        .sidebar-header p {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.1px;
            opacity: 0.75;
            margin-top: 8px;
        }

        .sidebar-menu {
            padding: 16px 0 24px;
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 13px 20px 13px 16px;
            border-left: 4px solid transparent;
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            transition: background-color 0.2s, border-color 0.2s, color 0.2s;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .menu-item:hover,
        .menu-item:active {
            background-color: rgba(255, 255, 255, 0.09);
            color: #ffffff;
        }

        .menu-item.active {
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%);
            border-left-color: #72d0ff;
            color: #ffffff;
            font-weight: 600;
        }

        .menu-item svg {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        /* Dropdown Menu */
        .menu-group {
            position: relative;
        }

        .menu-item-dropdown {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 20px 13px 16px;
            border-left: 4px solid transparent;
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            transition: background-color 0.2s, border-color 0.2s, color 0.2s;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .menu-item-dropdown:hover,
        .menu-item-dropdown:active {
            background-color: rgba(255, 255, 255, 0.09);
            color: #ffffff;
        }

        .menu-item-dropdown.active {
            background-color: rgba(255, 255, 255, 0.12);
            border-left-color: #72d0ff;
            color: #ffffff;
            font-weight: 600;
        }

        .menu-item-dropdown svg {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .dropdown-toggle {
            width: 16px;
            height: 16px;
            transition: transform 0.3s;
        }

        .menu-item-dropdown.active-dropdown .dropdown-toggle {
            transform: rotate(180deg);
        }

        .submenu {
            display: none;
            background-color: rgba(0, 0, 0, 0.16);
            padding: 4px 0;
            border-left: 3px solid rgba(255, 255, 255, 0.12);
        }

        .submenu.show {
            display: block;
        }

        .submenu-item {
            display: flex;
            align-items: center;
            padding: 11px 20px 11px 40px;
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
            transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
            font-size: 13.5px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .submenu-item:hover,
        .submenu-item:active {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
        }

        .submenu-item.active {
            background-color: rgba(255, 255, 255, 0.14);
            box-shadow: inset 3px 0 0 #72d0ff;
            color: #ffffff;
            font-weight: 600;
        }

        /* Nested dropdown styles */
        .submenu-item-dropdown {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 11px 20px 11px 40px;
            color: rgba(255, 255, 255, 0.85);
            cursor: pointer;
            font-size: 13.5px;
            transition: background-color 0.2s, color 0.2s;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .submenu-item-dropdown:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
        }

        .dropdown-toggle-sub {
            transition: transform 0.3s;
        }

        .submenu-item-dropdown.active-sub .dropdown-toggle-sub {
            transform: rotate(180deg);
        }

        .sub-submenu {
            display: none;
            background-color: rgba(0, 0, 0, 0.2);
            padding: 2px 0;
            border-left: 3px solid rgba(255, 255, 255, 0.18);
        }

        .sub-submenu.show {
            display: block;
        }

        .sub-submenu-item {
            display: flex;
            align-items: center;
            padding: 10px 20px 10px 60px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
            font-size: 13px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .sub-submenu-item:hover,
        .sub-submenu-item:active {
            background-color: rgba(255, 255, 255, 0.12);
            color: #ffffff;
        }

        .sub-submenu-item.active {
            background-color: rgba(255, 255, 255, 0.16);
            box-shadow: inset 3px 0 0 #72d0ff;
            color: #ffffff;
            font-weight: 600;
        }

        /* Navbar */
        .navbar {
            background: #ffffff;
            padding: 15px 28px;
            border-bottom: 1px solid #e3ebf5;
            box-shadow: 0 4px 16px rgba(13, 60, 120, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            position: sticky;
            top: 0;
            left: 0;
            z-index: 100;
        }

        .navbar-left {
            min-width: max-content;
        }

        .navbar-left h1 {
            font-size: 20px;
            font-weight: 700;
            color: #14294b;
            letter-spacing: 0.1px;
            white-space: nowrap;
        }

        .navbar-right {
            display: flex;
            align-items: center;
            gap: 20px;
            min-width: max-content;
        }

        /* Notification Styles */
        .notification-container {
            position: relative;
        }

        .notification-bell {
            position: relative;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .notification-bell:hover {
            background-color: rgba(13, 60, 120, 0.06);
        }

        .notification-bell svg {
            color: #3b4a63;
        }

        .notification-badge {
            position: absolute;
            top: 4px;
            right: 4px;
            background: linear-gradient(135deg, #e04552, #b91c2c);
            color: white;
            border-radius: 999px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 600;
            min-width: 18px;
            text-align: center;
        }

        .notification-dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 360px;
            max-height: 500px;
            background: white;
            border-radius: 14px;
            border: 1px solid #e3ebf5;
            box-shadow: 0 12px 32px rgba(13, 60, 120, 0.14);
            display: none;
            z-index: 1000;
            overflow: hidden;
        }

        .notification-dropdown.show {
            display: block;
        }

        .notification-header {
            padding: 16px 20px;
            border-bottom: 1px solid #e0e0e0;
            background: linear-gradient(135deg, #0066CC 0%, #003D82 100%);
        }

        .notification-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: white;
        }

        .notification-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .notification-item {
            padding: 16px 20px;
            border-bottom: 1px solid #eef2f8;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .notification-item:hover {
            background-color: #f6f9fe;
        }

        .notification-item:last-child {
            border-bottom: none;
        }

        .notification-item.warning {
            border-left: 4px solid #72d0ff;
        }

        .notification-item.info {
            border-left: 4px solid #2196F3;
        }

        .notification-item.success {
            border-left: 4px solid #4CAF50;
        }

        .notification-title {
            font-weight: 600;
            font-size: 14px;
            color: #14294b;
            margin-bottom: 4px;
        }

        .notification-message {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .notification-link {
            display: inline-block;
            font-size: 13px;
            color: #0066CC;
            text-decoration: none;
            font-weight: 500;
        }

        .notification-link:hover {
            text-decoration: underline;
        }

        .notification-empty {
            padding: 40px 20px;
            text-align: center;
            color: #999;
            font-size: 14px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0066CC 0%, #003D82 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }

        .user-details {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-size: 14px;
            font-weight: 600;
            color: #14294b;
        }

        .user-email {
            font-size: 12px;
            color: #64748b;
        }

        .btn-logout {
            padding: 9px 18px;
            background: linear-gradient(135deg, #e04552, #b91c2c);
            color: white;
            border: none;
            border-radius: 9px;
            cursor: pointer;
            font-size: 13.5px;
            font-weight: 600;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(224, 69, 82, 0.3);
        }

        /* Content Area */
        .content {
            padding: 32px;
            min-width: max-content;
        }

        /* Scrollbar for content (tipis) */
        .content::-webkit-scrollbar {
            height: 8px;
            width: 8px;
        }

        .content::-webkit-scrollbar-track {
            background: #e8eef7;
            border-radius: 8px;
        }

        .content::-webkit-scrollbar-thumb {
            background: #c3d3e8;
            border-radius: 8px;
        }

        .content::-webkit-scrollbar-thumb:hover {
            background: #a9bfdd;
        }

        .page-header {
            margin-bottom: 24px;
            min-width: max-content;
        }

        .page-header h2 {
            font-size: 25px;
            font-weight: 700;
            color: #14294b;
            letter-spacing: -0.2px;
            margin-bottom: 6px;
            white-space: nowrap;
        }

        .page-header p {
            color: #64748b;
            font-size: 14px;
            white-space: nowrap;
        }

        /* Cards */
        .card {
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e3ebf5;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(13, 60, 120, 0.06);
            margin-bottom: 24px;
            overflow: visible;
        }

        .card h3 {
            font-size: 15px;
            font-weight: 700;
            color: #14294b;
            letter-spacing: 0.2px;
            margin-bottom: 16px;
            padding-left: 12px;
            position: relative;
        }

        .card h3::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 15px;
            border-radius: 3px;
            background: linear-gradient(135deg, #0066CC 0%, #003D82 100%);
        }

        /* Pagination Fix */
        .pagination-wrapper nav {
            display: flex;
            justify-content: center;
        }

        .pagination-wrapper nav svg {
            width: 16px !important;
            height: 16px !important;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .sidebar {
                width: 240px;
            }

            .main-content {
                margin-left: 240px;
            }

            .menu-item,
            .menu-item-dropdown {
                padding: 12px 16px;
                font-size: 14px;
            }

            .submenu-item {
                padding: 10px 16px 10px 36px;
                font-size: 13px;
            }
        }

        @media (max-width: 1024px) {
            .navbar-right .user-details {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .sidebar.hidden {
                transform: translateX(-100%);
            }

            .sidebar:not(.hidden) {
                transform: translateX(0);
            }

            .navbar {
                padding: 12px 16px;
            }

            .navbar-left h1 {
                font-size: 18px;
            }

            .navbar-right {
                gap: 10px;
            }

            .navbar-right .user-info {
                gap: 8px;
            }

            .navbar-right .user-avatar {
                width: 35px;
                height: 35px;
            }

            .btn-logout {
                padding: 6px 12px;
                font-size: 12px;
            }

            .content {
                padding: 16px;
            }

            .main-content {
                width: 100vw;
                overflow-x: visible;
            }

            .content {
                min-width: auto;
            }

            .page-header h2 {
                font-size: 20px;
            }

            .card {
                padding: 16px;
                overflow: visible;
            }
        }

        /* Tablet Landscape */
        @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
            .sidebar {
                width: 220px;
            }

            .main-content {
                margin-left: 220px;
                width: calc(100vw - 220px);
            }

            .menu-item,
            .menu-item-dropdown {
                padding: 11px 15px;
                font-size: 14px;
            }

            .submenu-item {
                padding: 10px 15px 10px 32px;
                font-size: 13px;
            }
        }

        @media (max-width: 480px) {
            .navbar-left h1 {
                font-size: 16px;
            }

            .navbar-right .user-avatar {
                width: 30px;
                height: 30px;
                font-size: 12px;
            }

            .btn-logout {
                padding: 5px 10px;
                font-size: 11px;
            }

            .content {
                padding: 12px;
            }

            .page-header h2 {
                font-size: 18px;
            }

            .card {
                padding: 12px;
            }

            .table-container {
                font-size: 12px;
            }

            .table th,
            .table td {
                padding: 8px 10px;
            }

            .notification-dropdown {
                width: 300px;
                right: -20px;
            }

            .notification-bell {
                padding: 6px;
            }

            .notification-bell svg {
                width: 20px;
                height: 20px;
            }
        }

        /* Pipeline Web reference shell */
        :root {
            --shell-sidebar-width: 288px;
            --shell-sidebar: #0b83c9;
            --shell-blue: #0b83c9;
            --shell-accent: #72d0ff;
            --shell-muted: #d7effc;
        }

        body {
            background: #f5f7fa;
            color: #172033;
        }

        .sidebar {
            width: var(--shell-sidebar-width);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--shell-sidebar);
            border-radius: 0 0 52px 0;
            box-shadow: 5px 0 20px rgba(0, 35, 62, 0.14);
        }

        .main-content {
            margin-left: var(--shell-sidebar-width);
            width: calc(100vw - var(--shell-sidebar-width));
        }

        .sidebar-header {
            padding: 28px 24px 16px;
            border: 0;
            background: transparent;
        }

        .sidebar-brand {
            display: inline-flex;
            align-items: baseline;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -1.2px;
            white-space: nowrap;
        }

        .sidebar-brand .brand-pipeline,
        .sidebar-brand .brand-web {
            color: #f4f7fa;
            font-size: 29px;
            font-weight: 800;
        }

        .sidebar-brand .brand-web {
            color: var(--shell-accent);
            margin-left: 5px;
            font-weight: 700;
        }

        .sidebar-profile {
            display: flex;
            align-items: center;
            gap: 14px;
            margin: 12px 24px 20px;
            color: rgba(255, 255, 255, 0.82);
            text-decoration: none;
        }

        .sidebar-profile:hover {
            color: #ffffff;
        }

        .sidebar-profile-avatar {
            width: 62px;
            height: 62px;
            flex: 0 0 62px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.58);
            border-radius: 50%;
            background: #9aa9b6;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
        }

        .sidebar-profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .sidebar-profile-copy {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
            line-height: 1.15;
        }

        .sidebar-profile-name {
            overflow: hidden;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sidebar-profile-meta {
            overflow: hidden;
            color: var(--shell-muted);
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sidebar-search {
            position: relative;
            margin: 0 16px 16px;
        }

        .sidebar-search input {
            width: 100%;
            height: 40px;
            padding: 0 42px 0 14px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 12px;
            outline: none;
            background: rgba(255, 255, 255, 0.72);
            color: #24354a;
            font: inherit;
            font-size: 13px;
            transition: background 0.2s, box-shadow 0.2s;
        }

        .sidebar-search input:focus {
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(0, 114, 188, 0.28);
        }

        .sidebar-search svg {
            position: absolute;
            top: 50%;
            right: 14px;
            width: 18px;
            height: 18px;
            color: #546879;
            pointer-events: none;
            transform: translateY(-50%);
        }

        .sidebar-menu {
            flex: 1;
            min-height: 0;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 10px 0 54px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
        }

        .sidebar-menu::-webkit-scrollbar {
            width: 5px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.25);
        }

        .menu-item,
        .menu-item-dropdown {
            margin: 2px 10px;
            padding: 12px 14px;
            border-left: 3px solid transparent;
            border-radius: 8px;
            color: var(--shell-muted);
            font-size: 14px;
        }

        .menu-item:hover,
        .menu-item:active,
        .menu-item-dropdown:hover,
        .menu-item-dropdown:active {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }

        .menu-item.active,
        .menu-item-dropdown.active {
            border-left-color: var(--shell-accent);
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
        }

        .menu-item svg,
        .menu-item-dropdown svg {
            color: currentColor;
            stroke-width: 1.8;
        }

        .submenu {
            margin: 0 10px 5px 24px;
            border-left: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 0 0 8px 8px;
            background: rgba(0, 20, 38, 0.2);
        }

        .submenu-item {
            padding: 10px 12px 10px 18px;
            color: rgba(216, 226, 235, 0.78);
            font-size: 13px;
        }

        .submenu-item.active {
            background: rgba(255, 255, 255, 0.1);
            box-shadow: inset 3px 0 0 var(--shell-accent);
        }

        .navbar {
            min-height: 78px;
            padding: 0 28px;
            border-bottom: 1px solid #dce4ec;
            background: #ffffff;
            box-shadow: 0 3px 12px rgba(7, 42, 73, 0.07);
        }

        .navbar-left h1 {
            color: #003b63;
            font-size: 19px;
        }

        .hamburger-menu span {
            width: 27px;
            height: 3px;
            background: #003b63;
        }

        .navbar-right {
            gap: 12px;
        }

        .notification-bell svg {
            color: #003b63;
        }

        .navbar-right .user-info {
            display: none;
        }

        .btn-logout {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 4px;
            border-radius: 8px;
            background: transparent;
            color: #003b63;
            font-size: 15px;
        }

        .btn-logout svg {
            width: 22px;
            height: 22px;
        }

        .btn-logout:hover {
            background: rgba(0, 59, 99, 0.07);
            box-shadow: none;
            transform: none;
        }

        .page-loader {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;
            background: rgba(22, 29, 35, 0.42);
            opacity: 0;
            transition: opacity 0.16s ease, visibility 0.16s ease;
        }

        .page-loader.is-active {
            visibility: visible;
            opacity: 1;
        }

        .page-loader-card {
            width: 176px;
            min-height: 122px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            border-radius: 15px;
            background: #ffffff;
            box-shadow: 0 16px 40px rgba(0, 36, 64, 0.22);
        }

        .page-loader-dots {
            display: flex;
            align-items: center;
            gap: 7px;
            height: 25px;
        }

        .page-loader-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--shell-accent);
            animation: loaderWave 1.05s ease-in-out infinite;
        }

        .page-loader-dot:nth-child(2) {
            animation-delay: 0.12s;
        }

        .page-loader-dot:nth-child(3) {
            background: #2796d8;
            animation-delay: 0.24s;
        }

        .page-loader-dot:nth-child(4) {
            background: #0876c9;
            animation-delay: 0.36s;
        }

        .page-loader-label {
            color: #111827;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        @keyframes loaderWave {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-10px);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .page-loader-dot {
                animation: none;
            }
        }

        @media (min-width: 769px) and (max-width: 1200px) {
            :root {
                --shell-sidebar-width: 250px;
            }
        }

        @media (max-width: 768px) {
            .sidebar {
                width: min(88vw, 310px);
                border-radius: 0 0 38px 0;
            }

            .main-content,
            .main-content.expanded {
                width: 100vw;
                margin-left: 0;
            }

            .navbar {
                min-height: 66px;
            }

            .navbar-left h1 {
                max-width: 42vw;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .btn-logout span {
                display: none;
            }
        }
    </style>
    @stack('styles')
</head>
<body>
    <div class="page-loader is-active" id="pageLoader" role="status" aria-live="polite" aria-hidden="false">
        <div class="page-loader-card">
            <div class="page-loader-dots" aria-hidden="true">
                <span class="page-loader-dot"></span>
                <span class="page-loader-dot"></span>
                <span class="page-loader-dot"></span>
                <span class="page-loader-dot"></span>
            </div>
            <span class="page-loader-label">Loading...</span>
        </div>
    </div>

    <!-- Sidebar Overlay for Mobile -->
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
    
    <div class="main-container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <a href="{{ route('dashboard') }}" class="sidebar-brand" aria-label="Pipeline Web">
                    <span class="brand-pipeline">Pipeline</span><span class="brand-web">Web</span>
                </a>
            </div>

            <a href="{{ route('profile.index') }}" class="sidebar-profile">
                <span class="sidebar-profile-avatar">
                    @if(Auth::user()->photo)
                        <img src="{{ asset('storage/photos/' . Auth::user()->photo) }}" alt="{{ Auth::user()->name }}">
                    @else
                        {{ strtoupper(substr(Auth::user()->name ?? 'U', 0, 1)) }}
                    @endif
                </span>
                <span class="sidebar-profile-copy">
                    <span class="sidebar-profile-name">{{ Auth::user()->name ?? 'Pengguna' }}</span>
                    <span class="sidebar-profile-meta">{{ Auth::user()->pernr ?: strtoupper(Auth::user()->role ?? 'User') }}</span>
                </span>
            </a>

            <label class="sidebar-search" for="sidebarSearch">
                <input type="search" id="sidebarSearch" placeholder="Search menu" autocomplete="off">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
                </svg>
            </label>

            <nav class="sidebar-menu">
                <a href="{{ route('dashboard') }}" class="menu-item {{ request()->routeIs('dashboard') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dashboard
                </a>
                
                <a href="{{ route('aktivitas.index') }}" class="menu-item {{ request()->routeIs('aktivitas.*') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                    Aktivitas
                </a>
                
                <a href="{{ route('pipeline.index') }}" class="menu-item {{ request()->routeIs('pipeline.*') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Pipeline
                </a>
                
                @if(auth()->user()->isAdmin())
                <a href="{{ route('rekap.index') }}" class="menu-item {{ request()->routeIs('rekap.*') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Validasi
                </a>
                @endif
                
                {{-- @if(auth()->user()->isManager() || auth()->user()->isAdmin())
                <a href="{{ route('nasabah.index') }}" class="menu-item {{ request()->routeIs('nasabah.*') ? 'active' : '' }}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Nasabah
                </a>
                @endif --}}
                
                @if(auth()->user()->isAdmin())
                <a href="{{ route('uker.index') }}" class="menu-item {{ request()->routeIs('uker.*') ? 'active' : '' }}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Uker
                </a>
                @endif
                
                @if(auth()->user()->isAdmin())
                <a href="{{ route('rmft.index') }}" class="menu-item {{ request()->routeIs('rmft.*') ? 'active' : '' }}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    RMFT
                </a>
                
                <a href="{{ route('akun.index') }}" class="menu-item {{ request()->routeIs('akun.*') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Akun
                </a>
                
                <a href="{{ route('rencana-aktivitas.index') }}" class="menu-item {{ request()->routeIs('rencana-aktivitas.*') ? 'active' : '' }}" style="display: none;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    Rencana Aktivitas
                </a>
                
                <!-- Brispot Dropdown Menu -->
                <div class="menu-group">
                    <div class="menu-item-dropdown {{ request()->routeIs('brispot-dashboard.*') || request()->routeIs('brimaps.*') || request()->routeIs('merchant-des.*') || request()->routeIs('report-aktivitas-pemasaran.*') || request()->routeIs('rekap-brispot.*') || request()->routeIs('rekap-pemasaran.*') || request()->routeIs('rekap-cabang.*') || request()->routeIs('rekap-kualifikasi-done.*') || request()->routeIs('rekap-kcp.*') || request()->routeIs('rekap-produk.*') || request()->routeIs('list-pipeline.*') || request()->routeIs('report-potensi.*') || request()->routeIs('rekap-potensi.*') || request()->routeIs('belum-ditindaklanjuti.*') || request()->routeIs('rekap-ditindaklanjuti.*') || request()->routeIs('rekap-potensi-strategi.*') || request()->routeIs('rekap-potensi-nominal.*') || request()->routeIs('ssa-simpanan.*') ? 'active' : '' }}" onclick="toggleDropdown(this)">
                        <span style="display: flex; align-items: center;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                            </svg>
                            Brispot
                        </span>
                        <svg class="dropdown-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                    <div class="submenu {{ request()->routeIs('brispot-dashboard.*') || request()->routeIs('brimaps.*') || request()->routeIs('merchant-des.*') || request()->routeIs('report-aktivitas-pemasaran.*') || request()->routeIs('rekap-brispot.*') || request()->routeIs('rekap-cabang.*') || request()->routeIs('rekap-kualifikasi-done.*') || request()->routeIs('rekap-kcp.*') || request()->routeIs('rekap-produk.*') || request()->routeIs('rekap-pemasaran.*') || request()->routeIs('list-pipeline.*') || request()->routeIs('report-potensi.*') || request()->routeIs('rekap-potensi.*') || request()->routeIs('belum-ditindaklanjuti.*') || request()->routeIs('rekap-ditindaklanjuti.*') || request()->routeIs('rekap-potensi-strategi.*') || request()->routeIs('rekap-potensi-nominal.*') || request()->routeIs('ssa-simpanan.*') ? 'show' : '' }}">
                        <a href="{{ route('brispot-dashboard.index') }}" class="submenu-item {{ request()->routeIs('brispot-dashboard.*') ? 'active' : '' }}">
                            Dashboard
                        </a>
                        <a href="{{ route('rekap-brispot.index') }}" class="submenu-item {{ request()->routeIs('rekap-brispot.*') ? 'active' : '' }}">
                            Rekap Brispot
                        </a>
                        <a href="{{ route('rekap-cabang.index') }}" class="submenu-item {{ request()->routeIs('rekap-cabang.*') ? 'active' : '' }}">
                            Rekap Cabang
                        </a>
                        <a href="{{ route('rekap-kualifikasi-done.index') }}" class="submenu-item {{ request()->routeIs('rekap-kualifikasi-done.*') ? 'active' : '' }}">
                            Rekap Kualifikasi Done
                        </a>
                        <a href="{{ route('rekap-kcp.index') }}" class="submenu-item {{ request()->routeIs('rekap-kcp.*') ? 'active' : '' }}">
                            Rekap KCP
                        </a>
                        <a href="{{ route('rekap-produk.index') }}" class="submenu-item {{ request()->routeIs('rekap-produk.*') ? 'active' : '' }}">
                            Rekap Produk
                        </a>
                        <a href="{{ route('rekap-pemasaran.index') }}" class="submenu-item {{ request()->routeIs('rekap-pemasaran.*') ? 'active' : '' }}">
                            Rekap Prentase Gabungan
                        </a>
                        <a href="{{ route('list-pipeline.index') }}" class="submenu-item {{ request()->routeIs('list-pipeline.*') ? 'active' : '' }}">
                            List Pipeline
                        </a>
                        <a href="{{ route('brimaps.index') }}" class="submenu-item {{ request()->routeIs('brimaps.*') ? 'active' : '' }}">
                            Brimaps
                        </a>
                        <a href="{{ route('merchant-des.index') }}" class="submenu-item {{ request()->routeIs('merchant-des.*') ? 'active' : '' }}">
                            Merchant
                        </a>
                        <a href="{{ route('report-aktivitas-pemasaran.index') }}" class="submenu-item {{ request()->routeIs('report-aktivitas-pemasaran.*') ? 'active' : '' }}">
                            Pemasaran
                        </a>
                        <a href="{{ route('report-potensi.index') }}" class="submenu-item {{ request()->routeIs('report-potensi.*') ? 'active' : '' }}">
                            Data Report Potensi
                        </a>
                        <a href="{{ route('rekap-potensi.index') }}" class="submenu-item {{ request()->routeIs('rekap-potensi.*') ? 'active' : '' }}">
                            Rekap Potensi
                        </a>
                        <a href="{{ route('belum-ditindaklanjuti.index') }}" class="submenu-item {{ request()->routeIs('belum-ditindaklanjuti.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                POP
                            </span>
                        </a>
                        <a href="{{ route('rekap-ditindaklanjuti.index') }}" class="submenu-item {{ request()->routeIs('rekap-ditindaklanjuti.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Hot Pipeline
                            </span>
                        </a>
                        <a href="{{ route('rekap-potensi-strategi.index') }}" class="submenu-item {{ request()->routeIs('rekap-potensi-strategi.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Rekap Potensi Jumlah Leads
                            </span>
                        </a>
                        <a href="{{ route('rekap-potensi-nominal.index') }}" class="submenu-item {{ request()->routeIs('rekap-potensi-nominal.*') || request()->routeIs('ssa-simpanan.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Rekap Potensi Nominal
                            </span>
                        </a>
                        <a href="{{ route('nominatif-casa.index') }}" class="submenu-item {{ request()->routeIs('nominatif-casa.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Nominatif Casa CIF
                            </span>
                        </a>
                        <a href="{{ route('nominatif-not-closing.index') }}" class="submenu-item {{ request()->routeIs('nominatif-not-closing.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Nominatif Not Closing
                            </span>
                        </a>
                        <a href="{{ route('ssa-simpanan.index') }}" class="submenu-item {{ request()->routeIs('ssa-simpanan.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Generator SSA Simpanan
                            </span>
                        </a>
                        <a href="{{ route('average-marginal.index') }}" class="submenu-item {{ request()->routeIs('average-marginal.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Generator Average Marginal
                            </span>
                        </a>
                        <a href="{{ route('dana-talang.index') }}" class="submenu-item {{ request()->routeIs('dana-talang.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Verifikasi Dana Talang
                            </span>
                        </a>
                        <a href="{{ route('gabungan-tabungan.index') }}" class="submenu-item {{ request()->routeIs('gabungan-tabungan.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Rekap Gabungan Tabungan
                            </span>
                        </a>
                        <a href="{{ route('uker-marginal.index') }}" class="submenu-item {{ request()->routeIs('uker-marginal.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                Uker Marginal
                            </span>
                        </a>

                    </div>
                </div>
                @endif
                
                @if(auth()->user()->isAdmin())
                <!-- Produktivitas RMFT Dropdown Menu -->
                <div class="menu-group">
                    <div class="menu-item-dropdown {{ request()->routeIs('rekap-produktivitas-rmft.*') || request()->routeIs('report-historikal-rm-dana.*') || request()->routeIs('report-kpi-rmft-apraisal.*') || request()->routeIs('di319-prod-rmft.*') || request()->routeIs('di321-prod-rmft.*') || request()->routeIs('ci324-prod-rmft.*') ? 'active' : '' }}" onclick="toggleDropdown(this)">
                        <span style="display: flex; align-items: center;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            Produktivitas RMFT
                        </span>
                        <svg class="dropdown-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                    <div class="submenu {{ request()->routeIs('rekap-produktivitas-rmft.*') || request()->routeIs('report-historikal-rm-dana.*') || request()->routeIs('report-kpi-rmft-apraisal.*') || request()->routeIs('di319-prod-rmft.*') || request()->routeIs('di321-prod-rmft.*') || request()->routeIs('ci324-prod-rmft.*') ? 'show' : '' }}">
                        <a href="{{ route('rekap-produktivitas-rmft.index') }}" class="submenu-item {{ request()->routeIs('rekap-produktivitas-rmft.*') ? 'active' : '' }}">
                            Rekap Produktivitas RMFT
                        </a>
                        <a href="{{ route('report-historikal-rm-dana.index') }}" class="submenu-item {{ request()->routeIs('report-historikal-rm-dana.*') ? 'active' : '' }}">
                            Report Historikal RM Dana
                        </a>
                        <a href="{{ route('report-kpi-rmft-apraisal.index') }}" class="submenu-item {{ request()->routeIs('report-kpi-rmft-apraisal.*') ? 'active' : '' }}">
                            Report KPI RMFT Apraisal
                        </a>
                        <a href="{{ route('di319-prod-rmft.index') }}" class="submenu-item {{ request()->routeIs('di319-prod-rmft.*') ? 'active' : '' }}">
                            DI319 Tabungan
                        </a>
                        <a href="{{ route('di321-prod-rmft.index') }}" class="submenu-item {{ request()->routeIs('di321-prod-rmft.*') ? 'active' : '' }}">
                            DI321 Giro
                        </a>
                        <a href="{{ route('ci324-prod-rmft.index') }}" class="submenu-item {{ request()->routeIs('ci324-prod-rmft.*') ? 'active' : '' }}">
                            CI324 Deposito
                        </a>
                    </div>
                </div>
                
                <!-- Program Dropdown Menu - HIDDEN -->
                <div class="menu-group" style="display: none;">
                    <div class="menu-item-dropdown {{ request()->routeIs('program-sentinella.*') || request()->routeIs('program-bbk.*') || request()->routeIs('program-prolink.*') || request()->routeIs('program-superman.*') || request()->routeIs('program-rfd.*') || request()->routeIs('program-rtd.*') || request()->routeIs('program-rtb.*') ? 'active' : '' }}" onclick="toggleDropdown(this)">
                        <span style="display: flex; align-items: center;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            Program
                        </span>
                        <svg class="dropdown-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                    <div class="submenu {{ request()->routeIs('program-sentinella.*') || request()->routeIs('program-bbk.*') || request()->routeIs('program-prolink.*') || request()->routeIs('booster-deposito.*') || request()->routeIs('program-superman.*') || request()->routeIs('program-rfd.*') || request()->routeIs('program-rtd.*') || request()->routeIs('program-rtb.*') ? 'show' : '' }}">
                        <div class="submenu-item-dropdown {{ request()->routeIs('program-sentinella.*') || request()->routeIs('program-bbk.*') || request()->routeIs('program-prolink.*') || request()->routeIs('booster-deposito.*') || request()->routeIs('program-superman.*') ? 'active-sub' : '' }}" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                RFD (RETAIL FUNDING DEPARTMENT)
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu {{ request()->routeIs('program-sentinella.*') || request()->routeIs('program-bbk.*') || request()->routeIs('program-prolink.*') || request()->routeIs('booster-deposito.*') || request()->routeIs('program-superman.*') ? 'show' : '' }}">
                            <a href="{{ route('program-sentinella.index') }}" class="sub-submenu-item {{ request()->routeIs('program-sentinella.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Program Sentinella
                            </a>
                            <a href="{{ route('program-bbk.index') }}" class="sub-submenu-item {{ request()->routeIs('program-bbk.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                </svg>
                                Program BBK
                            </a>
                            <a href="{{ route('program-prolink.index') }}" class="sub-submenu-item {{ request()->routeIs('program-prolink.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                Program PROLINK
                            </a>
                            <a href="{{ route('booster-deposito.index') }}" class="sub-submenu-item {{ request()->routeIs('booster-deposito.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Booster Deposito
                            </a>
                            <a href="{{ route('program-superman.index') }}" class="sub-submenu-item {{ request()->routeIs('program-superman.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                                Program Superman
                            </a>
                        </div>
                        <a href="#" class="submenu-item {{ request()->routeIs('program-rtd.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                RTD (RETAIL TRANSACTION DEPARTMENT)
                            </span>
                        </a>
                        <a href="#" class="submenu-item {{ request()->routeIs('program-rtb.*') ? 'active' : '' }}">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                RTB (RETAIL TRANSACTION BANKING DEPARTMENT)
                            </span>
                        </a>
                    </div>
                </div>
                @endif
                
                @if(auth()->user()->isManager())
                <!-- Pull Of Pipeline Menu for Manager (Read-only) -->
                <div class="menu-group" style="display: none;">
                    <div class="menu-item-dropdown" onclick="toggleDropdown(this)">
                        <span style="display: flex; align-items: center;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                            </svg>
                            Pull Of Pipeline
                        </span>
                        <svg class="dropdown-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                    <div class="submenu">
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 1 - Optimalisasi Digital Channel
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.merchant-savol-qris') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.merchant-savol-qris') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                </svg>
                                Merchant QRIS Savol
                            </a>
                            <a href="{{ route('manager-pull-pipeline.merchant-savol-edc') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.merchant-savol-edc') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                </svg>
                                Merchant EDC Savol
                            </a>
                            <a href="{{ route('manager-pull-pipeline.penurunan-casa-brilink') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.penurunan-casa-brilink') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Penurunan Casa Brilink
                            </a>
                            <a href="{{ route('manager-pull-pipeline.brilink-saldo-kurang') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.brilink-saldo-kurang') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                Brilink Saldo < 10 Juta
                            </a>
                            <a href="{{ route('manager-pull-pipeline.qlola-non-debitur') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.qlola-non-debitur') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Qlola Non Debitur
                            </a>
                            <a href="{{ route('manager-pull-pipeline.qlola-user-tidak-aktif') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.qlola-user-tidak-aktif') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Non Debitur Memiliki Qlola Namun User Tdk Aktif
                            </a>
                            <a href="{{ route('manager-pull-pipeline.non-debitur-vol-besar') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.non-debitur-vol-besar') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Non Debitur Vol Besar
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 2 - Rekening Debitur Transaksi
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.qlola-nonaktif') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.qlola-nonaktif') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Qlola (Belum ada Qlola / ada namun nonaktif)
                            </a>
                            <a href="{{ route('manager-pull-pipeline.debitur-belum-memiliki-qlola') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.debitur-belum-memiliki-qlola') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Debitur Belum Memiliki Qlola
                            </a>
                            <a href="{{ route('manager-pull-pipeline.user-aktif-casa-kecil') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.user-aktif-casa-kecil') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                User Aktif Casa Kecil
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 3 - Optimalisasi Business Cluster
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.optimalisasi-business-cluster') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.optimalisasi-business-cluster') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Optimalisasi Business Cluster
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 4 - Peningkatan Payroll Berkualitas
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.existing-payroll') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.existing-payroll') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Existing Payroll
                            </a>
                            <a href="{{ route('manager-pull-pipeline.potensi-payroll') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.potensi-payroll') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Potensi Payroll
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 6 - Kolaborasi Perusahaan Anak
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.perusahaan-anak') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.perusahaan-anak') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Perusahaan Anak
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 7 - Optimalisasi Nasabah Prioritas & BOC BOD Nasabah Wholesale & Komersial
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.penurunan-prioritas-ritel-mikro') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.penurunan-prioritas-ritel-mikro') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Penurunan Prioritas Ritel & Mikro
                            </a>
                            <a href="{{ route('manager-pull-pipeline.aum-dpk') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.aum-dpk') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                AUM>2M DPK<50 juta
                            </a>
                            <a href="{{ route('manager-pull-pipeline.nasabah-downgrade') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.nasabah-downgrade') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                                </svg>
                                Nasabah Downgrade
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 8 - Penguatan Produk & Fungsi RM
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.strategi8') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.strategi8') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Winback
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                                </svg>
                                Layering
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('manager-pull-pipeline.layering') }}" class="sub-submenu-item {{ request()->routeIs('manager-pull-pipeline.layering') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                </svg>
                                Winback
                            </a>
                        </div>
                    </div>
                </div>
                @endif

                @if(auth()->user()->isAdmin())
                <!-- Pull Of Pipeline Menu for Admin -->
                <div class="menu-group" style="display: none;">
                    <div class="menu-item-dropdown" onclick="toggleDropdown(this)">
                        <span style="display: flex; align-items: center;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                            </svg>
                            Pull Of Pipeline
                        </span>
                        <svg class="dropdown-toggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                    <div class="submenu">
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 1 - Optimalisasi Digital Channel
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('merchant-savol-qris.index') }}" class="sub-submenu-item {{ request()->routeIs('merchant-savol-qris.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                </svg>
                                MERCHANT QRIS SAVOL BESAR CASA KECIL
                            </a>
                            <a href="{{ route('merchant-savol-edc.index') }}" class="sub-submenu-item {{ request()->routeIs('merchant-savol-edc.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                </svg>
                                MERCHANT EDC SAVOL BESAR CASA KECIL
                            </a>
                            <a href="{{ route('penurunan-casa-brilink.index') }}" class="sub-submenu-item {{ request()->routeIs('penurunan-casa-brilink.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                PENURUNAN CASA BRILINK
                            </a>
                            <a href="{{ route('brilink.index') }}" class="sub-submenu-item {{ request()->routeIs('brilink.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                BRILINK SALDO < 10 JUTA
                            </a>
                            <a href="{{ route('qlola-non-debitur.index') }}" class="sub-submenu-item {{ request()->routeIs('qlola-non-debitur.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Qlola Non Debitur
                            </a>
                            <a href="{{ route('qlola-user-tidak-aktif.index') }}" class="sub-submenu-item {{ request()->routeIs('qlola-user-tidak-aktif.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Non Debitur Memiliki Qlola Namun User Tdk Aktif
                            </a>
                            <a href="{{ route('non-debitur-vol-besar.index') }}" class="sub-submenu-item {{ request()->routeIs('non-debitur-vol-besar.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Non Dbitur Vol Besar CASA Kecil
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 2 - Rekening Debitur Transaksi
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('qlola-nonaktif.index') }}" class="sub-submenu-item {{ request()->routeIs('qlola-nonaktif.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Qlola (Belum ada Qlola / ada namun nonaktif)
                            </a>
                            <a href="{{ route('debitur-belum-memiliki-qlola.index') }}" class="sub-submenu-item {{ request()->routeIs('debitur-belum-memiliki-qlola.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Debitur Belum Memiliki Qlola
                            </a>
                            <a href="{{ route('user-aktif-casa-kecil.index') }}" class="sub-submenu-item {{ request()->routeIs('user-aktif-casa-kecil.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                User Aktif Casa Kecil
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 3 - Optimalisasi Business Cluster
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('optimalisasi-business-cluster.index') }}" class="sub-submenu-item {{ request()->routeIs('optimalisasi-business-cluster.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Optimalisasi Business Cluster
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 4 - Peningkatan Payroll Berkualitas
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('existing-payroll.index') }}" class="sub-submenu-item {{ request()->routeIs('existing-payroll.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Existing Payroll
                            </a>
                            <a href="{{ route('potensi-payroll.index') }}" class="sub-submenu-item {{ request()->routeIs('potensi-payroll.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Potensi Payroll
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 6 - Kolaborasi Perusahaan Anak
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('perusahaan-anak.index') }}" class="sub-submenu-item {{ request()->routeIs('perusahaan-anak.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                List Perusahaan Anak
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 7 - Optimalisasi Nasabah Prioritas & BOC BOD Nasabah Wholesale & Komersial
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('penurunan-prioritas-ritel-mikro.index') }}" class="sub-submenu-item {{ request()->routeIs('penurunan-prioritas-ritel-mikro.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                Penurunan Prioritas Ritel & Mikro
                            </a>
                            <a href="{{ route('aum-dpk.index') }}" class="sub-submenu-item {{ request()->routeIs('aum-dpk.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                AUM>2M DPK<50 juta
                            </a>
                            <a href="{{ route('nasabah-downgrade.index') }}" class="sub-submenu-item {{ request()->routeIs('nasabah-downgrade.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                                </svg>
                                Nasabah Downgrade
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                Strategi 8 - Penguatan Produk & Fungsi RM
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('strategi8.index') }}" class="sub-submenu-item {{ request()->routeIs('strategi8.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                Winback Penguatan Produk & Fungsi RM
                            </a>
                        </div>
                        <div class="submenu-item-dropdown" onclick="toggleSubDropdown(this)">
                            <span style="display: flex; align-items: center; width: 100%;">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 10px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                                </svg>
                                Layering
                            </span>
                            <svg class="dropdown-toggle-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: auto;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        <div class="sub-submenu">
                            <a href="{{ route('layering.index') }}" class="sub-submenu-item {{ request()->routeIs('layering.*') ? 'active' : '' }}">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 8px;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                </svg>
                                Winback
                            </a>
                        </div>
                    </div>
                </div>
                @endif

                <!-- Profile Menu - All users -->
                <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <a href="{{ route('profile.index') }}" class="menu-item {{ request()->routeIs('profile.*') ? 'active' : '' }}">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Profil Saya
                    </a>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Navbar -->
            <nav class="navbar">
                <div class="navbar-left" style="display: flex; align-items: center; gap: 15px;">
                    <button class="hamburger-menu" id="hamburgerMenu" onclick="toggleSidebar()" title="Toggle Sidebar">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <h1>@yield('page-title', 'Dashboard')</h1>
                </div>
                <div class="navbar-right">
                    <!-- Notification Bell -->
                    <div class="notification-container">
                        <button class="notification-bell" id="notificationBell" onclick="toggleNotifications()">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 24px; height: 24px;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                        </button>
                        <div class="notification-dropdown" id="notificationDropdown">
                            <div class="notification-header">
                                <h3>Notifikasi</h3>
                            </div>
                            <div class="notification-list" id="notificationList">
                                <div class="notification-empty">Tidak ada notifikasi</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="user-info">
                        <div class="user-avatar">
                            @if(Auth::user()->photo)
                                <img src="{{ asset('storage/photos/' . Auth::user()->photo) }}" alt="{{ Auth::user()->name }}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                            @else
                                {{ strtoupper(substr(Auth::user()->name ?? 'U', 0, 1)) }}
                            @endif
                        </div>
                        <div class="user-details">
                            <span class="user-name">{{ Auth::user()->name ?? 'User' }}</span>
                            <span class="user-email">{{ Auth::user()->email ?? '' }}</span>
                        </div>
                    </div>
                    <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                        @csrf
                        <button type="submit" class="btn-logout">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v10m6.36-7.36a9 9 0 1 1-12.72 0"/>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </nav>

            <!-- Content -->
            <div class="content">
                @yield('content')
            </div>
        </main>
    </div>

    <script>
        let loaderSafetyTimer = null;

        function showPageLoader() {
            const loader = document.getElementById('pageLoader');
            if (!loader) return;

            window.clearTimeout(loaderSafetyTimer);
            loader.classList.add('is-active');
            loader.setAttribute('aria-hidden', 'false');

            // Prevent the overlay from getting stuck when a link triggers a file download.
            loaderSafetyTimer = window.setTimeout(hidePageLoader, 15000);
        }

        function hidePageLoader() {
            const loader = document.getElementById('pageLoader');
            if (!loader) return;

            window.clearTimeout(loaderSafetyTimer);
            loader.classList.remove('is-active');
            loader.setAttribute('aria-hidden', 'true');
        }

        function initializeSidebarSearch() {
            const searchInput = document.getElementById('sidebarSearch');
            const menu = document.querySelector('.sidebar-menu');
            if (!searchInput || !menu) return;

            const searchableItems = Array.from(menu.children).filter((item) => {
                return item.classList.contains('menu-item') || item.classList.contains('menu-group');
            });

            searchableItems.forEach((item) => {
                item.dataset.originalDisplay = item.style.display || '';
            });

            searchInput.addEventListener('input', function() {
                const keyword = this.value.trim().toLocaleLowerCase('id-ID');

                searchableItems.forEach((item) => {
                    const text = item.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase('id-ID');
                    const isMatch = !keyword || text.includes(keyword);
                    item.style.display = isMatch ? item.dataset.originalDisplay : 'none';
                });
            });
        }

        window.addEventListener('load', hidePageLoader);
        window.addEventListener('pageshow', hidePageLoader);

        document.addEventListener('click', function(event) {
            const link = event.target.closest('a[href]');
            if (!link || event.defaultPrevented || event.button !== 0) return;
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (link.target === '_blank' || link.hasAttribute('download') || link.dataset.noLoader !== undefined) return;

            const href = link.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

            showPageLoader();
        });

        document.addEventListener('submit', function(event) {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || form.dataset.noLoader !== undefined || form.target === '_blank') return;

            window.setTimeout(function() {
                if (!event.defaultPrevented) showPageLoader();
            }, 0);
        });

        function toggleDropdown(element) {
            const submenu = element.nextElementSibling;
            submenu.classList.toggle('show');
            element.classList.toggle('active-dropdown');
        }

        function toggleSubDropdown(element) {
            const subSubmenu = element.nextElementSibling;
            subSubmenu.classList.toggle('show');
            element.classList.toggle('active-sub');
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            const overlay = document.getElementById('sidebarOverlay');
            const hamburger = document.getElementById('hamburgerMenu');
            
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('expanded');
            hamburger.classList.toggle('active');
            
            // Only show overlay on mobile
            if (window.innerWidth <= 768) {
                overlay.classList.toggle('active');
            }
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const hamburger = document.getElementById('hamburgerMenu');
            
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && !sidebar.classList.contains('hidden')) {
                    toggleSidebar();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            const overlay = document.getElementById('sidebarOverlay');
            
            if (window.innerWidth > 768) {
                overlay.classList.remove('active');
            }
        });

        // Initialize: Hide sidebar on mobile by default
        window.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            
            if (window.innerWidth <= 768) {
                sidebar.classList.add('hidden');
                mainContent.classList.add('expanded');
            }

            initializeSidebarSearch();

            // Load notifications
            loadNotifications();
        });

        // Notification functions
        function toggleNotifications() {
            const dropdown = document.getElementById('notificationDropdown');
            dropdown.classList.toggle('show');
        }

        // Close notification dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const notificationContainer = document.querySelector('.notification-container');
            const notificationBell = document.getElementById('notificationBell');
            
            if (notificationContainer && !notificationContainer.contains(event.target)) {
                const dropdown = document.getElementById('notificationDropdown');
                dropdown.classList.remove('show');
            }
        });

        function loadNotifications() {
            // Load notification count
            fetch('{{ route("api.notifications.count") }}')
                .then(response => response.json())
                .then(data => {
                    const badge = document.getElementById('notificationBadge');
                    if (data.count > 0) {
                        badge.textContent = data.count;
                        badge.style.display = 'block';
                    } else {
                        badge.style.display = 'none';
                    }
                })
                .catch(error => console.error('Error loading notification count:', error));

            // Load notifications
            fetch('{{ route("api.notifications") }}')
                .then(response => response.json())
                .then(data => {
                    const notificationList = document.getElementById('notificationList');
                    
                    if (data.notifications && data.notifications.length > 0) {
                        notificationList.innerHTML = '';
                        data.notifications.forEach(notification => {
                            const item = document.createElement('div');
                            item.className = `notification-item ${notification.type}`;
                            item.innerHTML = `
                                <div class="notification-title">${notification.title}</div>
                                <div class="notification-message">${notification.message}</div>
                                <a href="${notification.link}" class="notification-link">${notification.link_text}</a>
                            `;
                            notificationList.appendChild(item);
                        });
                    } else {
                        notificationList.innerHTML = '<div class="notification-empty">Tidak ada notifikasi</div>';
                    }
                })
                .catch(error => console.error('Error loading notifications:', error));
        }

        // Reload notifications every 5 minutes
        setInterval(loadNotifications, 300000);
    </script>

    @stack('scripts')
</body>
</html>





