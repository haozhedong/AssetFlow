package com.example.group3;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan({
		"com.example.group3.Asset.Mapper",
		"com.example.group3.Holding.Mapper",
		"com.example.group3.transaction.repository",
		"com.example.group3.market.repository"
})
@SpringBootApplication
public class Group3Application {

	public static void main(String[] args) {

		SpringApplication.run(Group3Application.class, args);
	}

}
