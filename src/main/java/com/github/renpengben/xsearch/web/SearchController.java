package com.github.renpengben.xsearch.web;

import com.alibaba.cloud.ai.graph.CompileConfig;
import com.alibaba.cloud.ai.graph.CompiledGraph;
import com.alibaba.cloud.ai.graph.StateGraph;
import com.alibaba.cloud.ai.graph.checkpoint.config.SaverConfig;
import com.alibaba.cloud.ai.graph.exception.GraphStateException;
import com.github.renpengben.xsearch.search.SearchService;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
public class SearchController {

  private final SearchService searchService;

  private final CompiledGraph compiledGraph;

  @Autowired
  public SearchController(SearchService searchService,
      @Qualifier("xSearchGraph") StateGraph xSearchGraph) throws GraphStateException {
    this.searchService = searchService;
    SaverConfig saverConfig = SaverConfig.builder().build();
    // 编译时可设中断点
    this.compiledGraph = xSearchGraph.compile(
        CompileConfig.builder().saverConfig(saverConfig).build());
  }


  @GetMapping("/search")
  ResponseEntity search(String query) {
    Map<String, Object> data = compiledGraph.invoke(Map.of("query", query)).get().data();
    return ResponseEntity.ok(data);
  }
}
