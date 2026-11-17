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
    <div className="bg-sky-50/50 border border-sky-200 rounded-lg p-5 shadow-2xs font-noto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-[#0f294a] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#133b6e]" />
            ❖ कौटुंबिक माहिती ❖
          </h4>
          <p className="text-sm sm:text-base text-slate-700 mt-0.5">
            आपल्या कुटुंबातील सदस्यांची माहिती नोंदवा.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-md text-sm sm:text-base font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          सदस्य जोडा
        </button>
      </div>

      {members.length === 0 ? (
        <div className="border border-dashed border-sky-300 rounded-lg p-6 text-center bg-white/90">
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            सध्या कोणताही कौटुंबिक सदस्य जोडलेला नाही. कुटुंबातील माहिती जोडण्यासाठी वरील <strong className="text-[#133b6e]">सदस्य जोडा</strong> बटणावर क्लिक करा.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md border border-sky-200">
          <table className="w-full text-left text-sm sm:text-base border-collapse">
            <thead>
              <tr className="bg-sky-100/90 text-[#0f294a] border-b border-sky-200 font-bold">
                <th className="p-3 text-center w-14 border-r border-sky-200">अ.क्र.</th>
                <th className="p-3 min-w-[200px] border-r border-sky-200">कुटुंबातील सदस्याचे संपूर्ण नाव</th>
                <th className="p-3 min-w-[120px] border-r border-sky-200">नाते</th>
                <th className="p-3 min-w-[130px] border-r border-sky-200">जन्म दिनांक / वय</th>
                <th className="p-3 min-w-[140px] border-r border-sky-200">व्यवसाय</th>
                <th className="p-3 min-w-[140px] border-r border-sky-200">शिक्षण</th>
                <th className="p-3 text-center w-14">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {members.map((member, index) => (
                <tr key={member.id} className="hover:bg-sky-50/50">
                  <td className="p-2.5 text-center font-bold text-[#0f294a] border-r border-sky-100 text-base">
                    {index + 1}
                  </td>
                  <td className="p-2.5 border-r border-sky-100">
                    <input
                      type="text"
                      value={member.fullName}
                      onChange={(e) => handleUpdate(member.id, 'fullName', e.target.value)}
                      placeholder="सदस्याचे पूर्ण नाव"
                      className="w-full px-3 py-2 border border-sky-200 rounded-md focus:border-[#133b6e] focus:outline-none text-sm sm:text-base bg-white font-semibold"
                    />
                  </td>
                  <td className="p-2.5 border-r border-sky-100">
                    <select
                      value={member.relation}
                      onChange={(e) => handleUpdate(member.id, 'relation', e.target.value)}
                      className="w-full px-3 py-2 border border-sky-200 rounded-md focus:border-[#133b6e] focus:outline-none text-sm sm:text-base bg-white font-semibold"
                    >
                      {RELATIONS.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5 border-r border-sky-100">
                    <input
                      type="text"
                      value={member.dob}
                      onChange={(e) => handleUpdate(member.id, 'dob', e.target.value)}
                      placeholder="उदा. 1990"
                      className="w-full px-3 py-2 border border-sky-200 rounded-md focus:border-[#133b6e] focus:outline-none text-sm sm:text-base bg-white font-semibold"
                    />
                  </td>
                  <td className="p-2.5 border-r border-sky-100">
                    <input
                      type="text"
                      value={member.occupation}
                      onChange={(e) => handleUpdate(member.id, 'occupation', e.target.value)}
                      placeholder="उदा. नोकरी / शेती"
                      className="w-full px-3 py-2 border border-sky-200 rounded-md focus:border-[#133b6e] focus:outline-none text-sm sm:text-base bg-white font-semibold"
                    />
                  </td>
                  <td className="p-2.5 border-r border-sky-100">
                    <input
                      type="text"
                      value={member.education}
                      onChange={(e) => handleUpdate(member.id, 'education', e.target.value)}
                      placeholder="शिक्षण"
                      className="w-full px-3 py-2 border border-sky-200 rounded-md focus:border-[#133b6e] focus:outline-none text-sm sm:text-base bg-white font-semibold"
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
