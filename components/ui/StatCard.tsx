
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { StatCardProps } from '../../types';

/**
 * Componente StatCard: Exibe métricas e estatísticas com gráficos minimalistas
 * 
 * @param title - Título da estatística
 * @param value - Valor principal em destaque
 * @param change - Porcentagem de alteração (ex: +12%)
 * @param icon - Ícone da Lucide-React
 * @param bgColor - Cor de fundo do card
 * @param textColor - Cor do texto principal/ícone
 * @param borderColor - Cor da borda
 * @param badgeBg - Cor de fundo do badge de porcentagem
 * @param chartData - Dados para o gráfico (opcional)
 * @param chartType - Tipo de representação Visual (bar, line, progress)
 * @param progress - Valor de progresso para chartType='progress'
 */
const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    icon: Icon,
    bgColor,
    textColor,
    borderColor,
    badgeBg,
    chartData,
    chartType = 'bar',
    progress
}) => {
    return (
        <div
            className={`p-6 rounded-[2rem] border ${borderColor} flex flex-col justify-between h-[200px] relative overflow-hidden shadow-sm transition-all hover:shadow-md`}
            style={{ backgroundColor: bgColor }}
        >
            <div>
                <div className="flex justify-between items-start mb-1">
                    <div className={`flex items-center space-x-2 ${textColor}`}>
                        <Icon size={18} />
                        <h4 className="text-gray-600 font-semibold text-sm sm:text-base">{title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold ${textColor} ${badgeBg} px-2 py-0.5 rounded-full`}>
                        {change}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            </div>

            {chartType === 'progress' ? (
                <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                        <span className="uppercase">Processando</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            ) : (
                <div className="h-16 w-full -mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={chartData}>
                                <Bar dataKey="value" fill="currentColor" className={textColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <LineChart data={chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="currentColor"
                                    className={textColor}
                                    strokeWidth="3"
                                    dot={false}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default StatCard;
