import React from 'react';
import { FamilyMember } from '../types/index';
import { RELATIONS } from '../utils/constants';
import { Plus, Trash2, Users } from 'lucide-react';

interface FamilyTableProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

export const FamilyTable: React.FC<FamilyTableProps> = ({ members, onChange }) => {
  const handleAddRow = () => {
    const newMember: FamilyMember = {
      id: 'f_' + Date.now(),
      srNo: members.length + 1,
      fullName: '',
      relation: 'आई',
      dob: '',
      occupation: '',
      education: '',
    };
    onChange([...members, newMember]);
  };

  const handleUpdate = (id: string, field: keyof FamilyMember, value: string) => {
    const updated = members.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    const filtered = members
      .filter((m) => m.id !== id)
      .map((m, idx) => ({ ...m, srNo: idx + 1 }));
    onChange(filtered);
  };

  return (
    <div className="bhagwa-texture-soft border border-[#e9bd92] rounded-xl p-5 shadow-2xs font-noto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-[#5c1d05] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#c2410c]" />
            ❖ कौटुंबिक माहिती ❖
          </h4>
          <p className="text-sm sm:text-base text-[#431407] mt-0.5">
            आपल्या कुटुंबातील सदस्यांची माहिती नोंदवा.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-sm sm:text-base font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto border border-[#9a3412]"
        >
          <Plus className="w-5 h-5" />
          सदस्य जोडा
        </button>
      </div>

      {members.length === 0 ? (
        <div className="border border-dashed border-[#df9c5c] rounded-lg p-6 text-center bg-white/95">
          <p className="text-sm sm:text-base text-[#431407] font-medium">
            सध्या कोणताही कौटुंबिक सदस्य जोडलेला नाही. कुटुंबातील माहिती जोडण्यासाठी वरील <strong className="text-[#9a3412]">सदस्य जोडा</strong> बटणावर क्लिक करा.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-[#e7b587]">
          <table className="w-full text-left text-sm sm:text-base border-collapse">
            <thead>
              <tr className="bhagwa-texture-medium text-[#431407] border-b border-[#df9c5c] font-bold">
                <th className="p-3 text-center w-14 border-r border-[#df9c5c]">अ.क्र.</th>
                <th className="p-3 min-w-[200px] border-r border-[#df9c5c]">कुटुंबातील सदस्याचे संपूर्ण नाव</th>
                <th className="p-3 min-w-[120px] border-r border-[#df9c5c]">नाते</th>
                <th className="p-3 min-w-[130px] border-r border-[#df9c5c]">जन्म दिनांक / वय</th>
                <th className="p-3 min-w-[140px] border-r border-[#df9c5c]">व्यवसाय</th>
                <th className="p-3 min-w-[140px] border-r border-[#df9c5c]">शिक्षण</th>
                <th className="p-3 text-center w-14">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3d4b4]">
              {members.map((member, index) => (
                <tr key={member.id} className="hover:bg-[#fff7ed]">
                  <td className="p-2.5 text-center font-bold text-[#7c2d12] border-r border-[#f3d4b4] text-base">
                    {index + 1}
                  </td>
                  <td className="p-2.5 border-r border-[#f3d4b4]">
                    <input
                      type="text"
                      value={member.fullName}
                      onChange={(e) => handleUpdate(member.id, 'fullName', e.target.value)}
                      placeholder="सदस्याचे पूर्ण नाव"
                      className="w-full px-3 py-2 border border-[#e7b587] rounded-md focus:border-[#c2410c] focus:outline-none text-sm sm:text-base bg-white font-semibold text-[#29150b]"
                    />
                  </td>
                  <td className="p-2.5 border-r border-[#f3d4b4]">
                    <select
                      value={member.relation}
                      onChange={(e) => handleUpdate(member.id, 'relation', e.target.value)}
                      className="w-full px-3 py-2 border border-[#e7b587] rounded-md focus:border-[#c2410c] focus:outline-none text-sm sm:text-base bg-white font-semibold text-[#29150b]"
                    >
                      {RELATIONS.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5 border-r border-[#f3d4b4]">
                    <input
                      type="text"
                      value={member.dob}
                      onChange={(e) => handleUpdate(member.id, 'dob', e.target.value)}
                      placeholder="उदा. 1990"
                      className="w-full px-3 py-2 border border-[#e7b587] rounded-md focus:border-[#c2410c] focus:outline-none text-sm sm:text-base bg-white font-semibold text-[#29150b]"
                    />
                  </td>
                  <td className="p-2.5 border-r border-[#f3d4b4]">
                    <input
                      type="text"
                      value={member.occupation}
                      onChange={(e) => handleUpdate(member.id, 'occupation', e.target.value)}
                      placeholder="उदा. नोकरी / शेती"
                      className="w-full px-3 py-2 border border-[#e7b587] rounded-md focus:border-[#c2410c] focus:outline-none text-sm sm:text-base bg-white font-semibold text-[#29150b]"
                    />
                  </td>
                  <td className="p-2.5 border-r border-[#f3d4b4]">
                    <input
                      type="text"
                      value={member.education}
                      onChange={(e) => handleUpdate(member.id, 'education', e.target.value)}
                      placeholder="शिक्षण"
                      className="w-full px-3 py-2 border border-[#e7b587] rounded-md focus:border-[#c2410c] focus:outline-none text-sm sm:text-base bg-white font-semibold text-[#29150b]"
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id)}
                      className="p-2 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="सदस्य हटवा"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
