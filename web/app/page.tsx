import { createClient } from '@supabase/supabase-js';

// 1. 定義資料的形狀 (TypeScript 的好處，維護一目瞭然)
interface TeamStanding {
  team_id: number;
  team_name: string;
  conference: 'East' | 'West';
  wins: number;
  losses: number;
  win_pct: number;
}

// 2. 建立資料庫連線
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 設定資料每 60 秒會重新抓取一次 (ISR)
export const revalidate = 60;

export default async function Home() {
  // 3. 從資料庫抓取資料，並依照勝率由高到低排序
  const { data: teams, error } = await supabase
    .from('nba_standings')
    .select('*')
    .order('win_pct', { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">讀取錯誤: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🏀 NBA 即時戰績看板</h1>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow">
            賽季: 2024-25
          </span>
        </div>

        {/* 表格區塊 */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">排名</th>
                <th className="p-4 font-semibold">球隊</th>
                <th className="p-4 font-semibold text-center">分區</th>
                <th className="p-4 font-semibold text-center">勝 (W)</th>
                <th className="p-4 font-semibold text-center">敗 (L)</th>
                <th className="p-4 font-semibold text-center">勝率 (PCT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams?.map((team: TeamStanding, index) => (
                <tr key={team.team_id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 text-gray-500 font-mono">#{index + 1}</td>
                  <td className="p-4 font-bold text-gray-800 text-lg">
                    {team.team_name}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        team.conference === 'West'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {team.conference}
                    </span>
                  </td>
                  <td className="p-4 text-center font-semibold text-green-600">
                    {team.wins}
                  </td>
                  <td className="p-4 text-center font-semibold text-red-500">
                    {team.losses}
                  </td>
                  <td className="p-4 text-center font-mono text-gray-700">
                    {(team.win_pct * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <footer className="mt-8 text-center text-gray-400 text-sm">
          資料來源: NBA Official API | 自動化更新系統
        </footer>
      </div>
    </main>
  );
}