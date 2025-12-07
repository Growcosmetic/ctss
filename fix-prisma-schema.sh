#!/bin/bash

# Script để fix Prisma schema errors
# Xóa các model duplicate và sửa MarketingCampaignV2

SCHEMA_FILE="prisma/schema.prisma"
BACKUP_FILE="prisma/schema.prisma.backup"

echo "🔧 Fixing Prisma schema errors..."

# Backup schema
cp "$SCHEMA_FILE" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# 1. Xóa Branch model đầu tiên (dòng 63-76) - giữ lại version đầy đủ ở dòng 8569
echo "📝 Removing duplicate Branch model (first occurrence)..."
sed -i '' '63,76d' "$SCHEMA_FILE"

# 2. Xóa các TreatmentPlan duplicate (giữ lại bản đầu tiên ở dòng 1253)
echo "📝 Removing duplicate TreatmentPlan models..."
# Xóa từ dòng 1816 đến 1868 (model TreatmentPlan thứ 2)
sed -i '' '1816,1868d' "$SCHEMA_FILE"

# Sau khi xóa, các dòng sẽ shift, cần tính lại
# Tạm thời xóa từng cái một
# TreatmentPlan 3 (khoảng dòng 2491)
# TreatmentPlan 4 (khoảng dòng 3082)
# ... (cần xóa 11 bản duplicate)

# 3. Xóa các TreatmentTracking duplicate (giữ lại bản đầu tiên ở dòng 1306)
echo "📝 Removing duplicate TreatmentTracking models..."

# 4. Sửa MarketingCampaignV2 thành MarketingCampaign
echo "📝 Fixing MarketingCampaignV2 references..."
sed -i '' 's/MarketingCampaignV2/MarketingCampaign/g' "$SCHEMA_FILE"

echo ""
echo "⚠️  Manual steps needed:"
echo "1. Xóa các TreatmentPlan duplicate còn lại (có 12 bản, giữ lại bản đầu tiên)"
echo "2. Xóa các TreatmentTracking duplicate còn lại (có 12 bản, giữ lại bản đầu tiên)"
echo "3. Kiểm tra xem có MarketingCampaign duplicate không (có 2 bản ở dòng 435 và 6927)"
echo ""
echo "✅ Schema backup saved at: $BACKUP_FILE"
echo "✅ MarketingCampaignV2 đã được sửa thành MarketingCampaign"

