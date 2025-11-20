import pandas as pd
from nba_api.stats.endpoints import leaguestandings
from supabase import create_client

# ==========================================
# 1. 設定區 (從環境變數讀取，不直接寫在程式碼裡)
# ==========================================
import os # <-- 新增這行
from nba_api.stats.endpoints import leaguestandings
from supabase import create_client

# 從系統的環境變數讀取密鑰
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
# 建立 Supabase 連線
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def update_standings():
    print("🏀 正在連線 NBA API 抓取最新戰績...")
    
    # 2. 呼叫 NBA API (這裡設定為 2024-25 賽季)
    # 如果你想抓上一季，可以改成 '2023-24'
    standings = leaguestandings.LeagueStandings(season='2024-25') 
    
    # 將抓到的資料轉成 DataFrame 表格格式
    df = standings.get_data_frames()[0]
    
    # 3. 整理資料 (只取我們資料庫需要的欄位)
    data_to_upload = []
    for index, row in df.iterrows():
        team_data = {
            "team_id": row['TeamID'],
            "team_name": row['TeamCity'] + ' ' + row['TeamName'], # 組合城市與隊名，如 Los Angeles Lakers
            "conference": row['Conference'],
            "wins": row['WINS'],
            "losses": row['LOSSES'],
            "win_pct": row['WinPCT']
        }
        data_to_upload.append(team_data)
        
    print(f"✅ 成功抓到 {len(data_to_upload)} 支球隊資料，準備上傳...")

    # 4. 上傳至 Supabase 
    # upsert 的意思是：如果這支球隊已經在資料庫裡，就更新它的戰績；如果不在，就新增它。
    try:
        response = supabase.table('nba_standings').upsert(data_to_upload).execute()
        print("🚀 大功告成！資料庫已更新完畢！")
    except Exception as e:
        print(f"❌ 上傳失敗: {e}")

# 執行主程式
if __name__ == "__main__":
    update_standings()