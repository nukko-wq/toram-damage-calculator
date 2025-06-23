# トーラムオンライン ダメージ計算ツール - 設計書集

## 概要

大規模化した設計書を機能別・目的別に整理分割した文書群です。各設計書は独立して理解できるよう構成されており、開発効率と保守性の向上を図っています。

## 文書分類

## docs/technical/ - 技術仕様関連

### 基本・アーキテクチャ
- [00_overview.md](./technical/00_overview.md) - 基本技術仕様（概要、技術スタック、プロジェクト構造、状態管理）
- [validation.md](./technical/validation.md) - フォームバリデーション仕様
- [save-data.md](./technical/save-data.md) - セーブデータ管理仕様

### システム設計
- [future-extensions.md](./technical/future-extensions.md) - 将来拡張設計
- [free-input-slots.md](./technical/free-input-slots.md) - 自由入力装備スロット拡張
- [register-system.md](./technical/register-system.md) - レジスタ他システム
- [calculation-result-system.md](./technical/calculation-result-system.md) - ステータス計算結果表示システム

## docs/database/ - データベース設計

### データ構造
- [equipment.md](./database/equipment.md) - 装備データベース構造
- [crystal.md](./database/crystal.md) - クリスタルデータベース構造
- [enemy.md](./database/enemy.md) - 敵情報データベース構造
- [food.md](./database/food.md) - 料理データベース構造
- [buff-skill.md](./database/buff-skill.md) - バフスキルシステム構造
- [buff-item.md](./database/buff-item.md) - バフアイテムデータベース構造
- [data-management.md](./database/data-management.md) - データ管理パターン

## docs/calculations/ - ステータス計算式

### 計算式仕様
- [overview.md](./calculations/overview.md) - 計算式ドキュメント概要
- [basic-stats.md](./calculations/basic-stats.md) - 基本ステータス計算式（HP、MP）
- [attack-stats.md](./calculations/attack-stats.md) - 攻撃関連ステータス計算式
- [defense-stats.md](./calculations/defense-stats.md) - 防御関連ステータス計算式
- [equipment-bonuses.md](./calculations/equipment-bonuses.md) - 装備品補正値計算
- [crystal-effects.md](./calculations/crystal-effects.md) - クリスタ効果計算
- [damage-formulas.md](./calculations/damage-formulas.md) - 最終ダメージ計算式

## docs/ui/ - UI設計

### インターフェース
- [equipment-customization.md](./ui/equipment-customization.md) - 装備カスタム機能UI仕様
- [selection-modals.md](./ui/selection-modals.md) - 選択モーダルUI仕様
- [header-component.md](./ui/header-component.md) - ヘッダーコンポーネント・計算結果ボタンバー設計

## docs/store/ - Zustand状態管理設計

### 状態管理アーキテクチャ
- [overview.md](./store/overview.md) - Zustand状態管理の全体設計
- [calculator-store.md](./store/calculator-store.md) - メイン計算データ管理ストア
- [save-data-store.md](./store/save-data-store.md) - セーブデータ管理ストア
- [ui-store.md](./store/ui-store.md) - UI状態管理ストア
- [integration.md](./store/integration.md) - React Hook Form統合・パフォーマンス最適化

### ローカルストレージ設計
- [storage-overview.md](./database/storage-overview.md) - ローカルストレージシステム概要
- [save-data-storage.md](./database/save-data-storage.md) - セーブデータ管理
- [custom-data-storage.md](./database/custom-data-storage.md) - カスタムデータ管理
- [data-sync.md](./database/data-sync.md) - データ同期・バージョン管理
- [storage-optimization.md](./database/storage-optimization.md) - パフォーマンス・エラーハンドリング

## docs/requirements/ - 要件定義

### システム要件
- [00_overview.md](./requirements/00_overview.md) - プロジェクト概要
- [01_basic-system.md](./requirements/01_basic-system.md) - 基本システム要件
- [02_weapon-system.md](./requirements/02_weapon-system.md) - 武器システム要件
- [03_equipment-system.md](./requirements/03_equipment-system.md) - 装備システム要件
- [05_buff-systems.md](./requirements/05_buff-systems.md) - バフシステム要件
- [06_enemy-system.md](./requirements/06_enemy-system.md) - 敵システム要件
- [07_calculation-result.md](./requirements/07_calculation-result.md) - 計算結果要件
- [08_ui-ux-requirements.md](./requirements/08_ui-ux-requirements.md) - UI/UX要件
- [09_technical-requirements.md](./requirements/09_technical-requirements.md) - 技術要件

## 分割の目的

1. **保守性向上** - 各システムの仕様を独立して理解・更新可能
2. **開発効率向上** - 担当領域別に必要な仕様のみ参照可能
3. **理解促進** - セクション別の詳細な仕様により実装方針が明確化
4. **拡張性向上** - 新機能追加時の影響範囲と必要な変更の特定が容易

## 利用方法

### 開発段階別ガイド

- **プロジェクト理解**: requirements/00_overview.md から全体像を把握
- **要件確認**: requirements/ で各システムの詳細要件を確認
- **アーキテクチャ設計**: technical/00_overview.md で技術方針を理解
- **データ設計**: database/ でデータ構造と管理方法を確認
- **状態管理**: store/ でZustand設計を理解
- **UI実装**: ui/ でインターフェース仕様を参照
- **機能拡張**: technical/future-extensions.md で拡張方針を確認

### 担当領域別ガイド

- **フロントエンド開発者**: requirements/ → technical/ → store/ → ui/
- **データベース設計者**: database/ → store/
- **UI/UXデザイナー**: requirements/ → ui/
- **ゲームシステム設計者**: calculations/ → requirements/
- **プロジェクトマネージャー**: requirements/ → technical/00_overview.md

## 元の設計書について

以下の元設計書ファイルは参考用として保持されていますが、最新の仕様は分割後の文書を参照してください：

- `要件定義書.md` → `docs/requirements/` 配下に分割
- `技術仕様書.md` → `docs/technical/`, `docs/database/`, `docs/ui/` 配下に分割
- `ローカルストレージ設計書.md` → `docs/database/` 配下に分割
- `Zustand設計書.md` → `docs/store/` 配下に分割

各分割ファイルは独立して理解できるよう構成されており、必要に応じて適切なヘッダーと説明が追加されています。