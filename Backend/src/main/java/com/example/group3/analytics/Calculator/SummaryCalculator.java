package com.example.group3.analytics.Calculator;

import com.example.group3.analytics.dto.HoldingSnapshot;
import com.example.group3.analytics.dto.PortfolioSummaryResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

//input : all holdings * latest_price
//output : portfolioSummaryResponse
//首页五个kpi数字
@Component
public class SummaryCalculator {

    public PortfolioSummaryResponse calculate(List<HoldingSnapshot> snapshots) {
        BigDecimal totalCost = BigDecimal.ZERO; //组合总成本
        BigDecimal totalMarketValue = BigDecimal.ZERO; //组合总市值

        for (HoldingSnapshot snapshot : snapshots) {
            totalCost = totalCost.add(snapshot.getCost());
            totalMarketValue = totalMarketValue.add(snapshot.getMarketValue());
        }

        // 计算总盈亏
        BigDecimal unrealizedPnl = totalMarketValue.subtract(totalCost).setScale(2, RoundingMode.HALF_UP);

        //收益率
        BigDecimal returnPct = BigDecimal.ZERO;
        //判0后计算收益率（总成本大于0才能计算收益率）
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            returnPct = unrealizedPnl
                    .divide(totalCost, 4, RoundingMode.HALF_UP) //收益率 = 总盈亏 / 总成本
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        //创建响应对象
        PortfolioSummaryResponse response = new PortfolioSummaryResponse();
        response.setTotalCost(totalCost.setScale(2, RoundingMode.HALF_UP));
        response.setTotalMarketValue(totalMarketValue.setScale(2, RoundingMode.HALF_UP));
        response.setUnrealizedPnl(unrealizedPnl);
        response.setReturnPct(returnPct);
        response.setHoldingCount(snapshots.size());
        return response;
    }
}